package ru.itmo.is.lab1.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import ru.itmo.is.lab1.dto.ImportHistoryDTO;
import ru.itmo.is.lab1.dto.ImportResultDTO;
import ru.itmo.is.lab1.dto.PageResponse;
import ru.itmo.is.lab1.dto.WorkerDTO;
import ru.itmo.is.lab1.entity.*;
import ru.itmo.is.lab1.repository.ImportHistoryRepository;
import ru.itmo.is.lab1.repository.OrganizationRepository;
import ru.itmo.is.lab1.repository.UserRepository;
import ru.itmo.is.lab1.repository.WorkerRepository;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Сервис импорта работников с поддержкой двухфазного коммита.
 * 
 * Реализует распределённую транзакцию между:
 * - PostgreSQL (основная БД)
 * - MinIO (файловое хранилище)
 * 
 * Фазы двухфазного коммита:
 * 1. PREPARE: Загрузка файла в pending директорию MinIO + начало DB транзакции
 * 2. COMMIT/ROLLBACK: 
 *    - При успехе: файл перемещается из pending, DB транзакция коммитится
 *    - При ошибке: pending файл удаляется, DB транзакция откатывается
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ImportService {

    private final ImportHistoryRepository importHistoryRepository;
    private final WorkerRepository workerRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final MapperService mapperService;
    private final WorkerValidationService validationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final MinioService minioService;

    @PersistenceContext
    private EntityManager entityManager;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    /**
     * Импортирует работников из JSON файла с двухфазным коммитом.
     * 
     * Порядок операций (Two-Phase Commit):
     * 1. PREPARE Phase:
     *    a) Загружаем файл в MinIO (pending директорию)
     *    b) Парсим и валидируем данные
     *    c) Сохраняем записи в БД (в рамках транзакции)
     * 
     * 2. COMMIT Phase (при успехе всех операций):
     *    a) Коммитим транзакцию БД
     *    b) Перемещаем файл из pending в постоянное хранилище
     * 
     * 3. ROLLBACK Phase (при любой ошибке):
     *    a) Откатываем транзакцию БД
     *    b) Удаляем pending файл из MinIO
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public ImportResultDTO importWorkers(MultipartFile file, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        // Создаём запись в истории импорта
        ImportHistory importHistory = new ImportHistory();
        importHistory.setUser(user);
        importHistory.setStatus(ImportStatus.IN_PROGRESS);
        importHistory.setFileName(file.getOriginalFilename());
        importHistory = importHistoryRepository.save(importHistory);

        String pendingObjectName = null;

        try {
            // === ФАЗА 1: PREPARE ===
            log.info("=== 2PC PREPARE Phase ===");

            // 1.1 Загружаем файл в MinIO (pending)
            log.info("Загрузка файла в MinIO (pending)...");
            pendingObjectName = minioService.prepareUpload(file, userId);
            log.info("Файл загружен в pending: {}", pendingObjectName);

            // Сохраняем pending имя для использования при откате
            final String finalPendingObjectName = pendingObjectName;

            // 1.2 Парсим JSON файл
            List<WorkerDTO> workerDTOs = objectMapper.readValue(
                    file.getInputStream(),
                    new TypeReference<List<WorkerDTO>>() {}
            );

            if (workerDTOs.isEmpty()) {
                throw new RuntimeException("Файл не содержит записей для импорта");
            }

            // 1.3 Валидируем и сохраняем работников
            List<Worker> savedWorkers = new ArrayList<>();

            for (int i = 0; i < workerDTOs.size(); i++) {
                final int rowNumber = i + 1;
                WorkerDTO dto = workerDTOs.get(i);
                
                // Валидация бизнес-правил
                validationService.validateWorkerForImport(dto, rowNumber);

                Worker worker = mapperService.toEntity(dto);
                worker.setId(null);

                // Обработка существующей организации
                if (worker.getOrganization() != null && worker.getOrganization().getId() != null) {
                    Organization existingOrg = organizationRepository.findById(worker.getOrganization().getId())
                            .orElseThrow(() -> new RuntimeException(
                                    "Строка " + rowNumber + ": Организация с ID " + worker.getOrganization().getId() + " не найдена"));
                    worker.setOrganization(existingOrg);
                }

                savedWorkers.add(workerRepository.save(worker));
            }

            // 1.4 Обновляем историю импорта
            importHistory.setStatus(ImportStatus.SUCCESS);
            importHistory.setAddedCount(savedWorkers.size());
            importHistory.setMinioObjectName(pendingObjectName.replace("pending/", ""));
            importHistoryRepository.save(importHistory);

            // === ФАЗА 2: COMMIT ===
            // Регистрируем callback для коммита MinIO после успешного коммита БД
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    try {
                        log.info("=== 2PC COMMIT Phase ===");
                        String finalObjectName = minioService.commitUpload(finalPendingObjectName);
                        log.info("MinIO коммит успешен: {}", finalObjectName);
                    } catch (Exception e) {
                        // Логируем ошибку, но не откатываем БД (уже закоммичена)
                        // Файл останется в pending и может быть очищен позже
                        log.error("Ошибка коммита MinIO (БД уже закоммичена): {}", e.getMessage());
                    }
                }

                @Override
                public void afterCompletion(int status) {
                    if (status == TransactionSynchronization.STATUS_ROLLED_BACK) {
                        log.info("=== 2PC ROLLBACK Phase ===");
                        minioService.rollbackUpload(finalPendingObjectName);
                        log.info("MinIO откат выполнен");
                    }
                }
            });

            // Отправляем уведомления через WebSocket
            savedWorkers.forEach(worker -> {
                WorkerDTO result = mapperService.toDTO(worker);
                messagingTemplate.convertAndSend("/topic/workers/created", result);
            });

            List<WorkerDTO> resultDTOs = savedWorkers.stream()
                    .map(mapperService::toDTO)
                    .collect(Collectors.toList());

            log.info("Импорт успешно завершён. Добавлено работников: {}", savedWorkers.size());

            return new ImportResultDTO(
                    importHistory.getId(),
                    ImportStatus.SUCCESS,
                    savedWorkers.size(),
                    null,
                    resultDTOs
            );

        } catch (Exception e) {
            log.error("=== 2PC ROLLBACK Phase (ошибка) ===");
            log.error("Ошибка импорта: ", e);
            
            // Откатываем MinIO сразу (не ждём afterCompletion, так как может быть не зарегистрирован)
            if (pendingObjectName != null) {
                minioService.rollbackUpload(pendingObjectName);
            }

            importHistory.setStatus(ImportStatus.FAILED);
            importHistory.setErrorMessage(e.getMessage());
            importHistory.setAddedCount(0);
            importHistoryRepository.save(importHistory);

            // Откат транзакции произойдет автоматически
            throw new RuntimeException("Ошибка импорта: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<ImportHistoryDTO> getImportHistory(Long userId, boolean isAdmin, Pageable pageable) {
        Page<ImportHistory> page;
        
        if (isAdmin) {
            page = importHistoryRepository.findAll(pageable);
        } else {
            page = importHistoryRepository.findByUserId(userId, pageable);
        }

        List<ImportHistoryDTO> content = page.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        PageResponse<ImportHistoryDTO> response = new PageResponse<>();
        response.setContent(content);
        response.setPageNumber(page.getNumber());
        response.setPageSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLast(page.isLast());
        response.setFirst(page.isFirst());

        return response;
    }

    /**
     * Получает файл импорта из MinIO.
     */
    public InputStream getImportFile(Long historyId, Long userId, boolean isAdmin) throws Exception {
        ImportHistory history = importHistoryRepository.findById(historyId)
                .orElseThrow(() -> new RuntimeException("Запись импорта не найдена"));

        // Проверяем права доступа
        if (!isAdmin && !history.getUser().getId().equals(userId)) {
            throw new RuntimeException("Нет доступа к этому файлу");
        }

        if (history.getMinioObjectName() == null || history.getMinioObjectName().isEmpty()) {
            throw new RuntimeException("Файл не найден в хранилище");
        }

        return minioService.getFile(history.getMinioObjectName());
    }

    /**
     * Получает имя файла из истории импорта.
     */
    @Transactional(readOnly = true)
    public String getImportFileName(Long historyId) {
        ImportHistory history = importHistoryRepository.findById(historyId)
                .orElseThrow(() -> new RuntimeException("Запись импорта не найдена"));
        return history.getFileName();
    }

    private ImportHistoryDTO toDTO(ImportHistory history) {
        ImportHistoryDTO dto = new ImportHistoryDTO();
        dto.setId(history.getId());
        dto.setStatus(history.getStatus());
        dto.setUsername(history.getUser().getUsername());
        dto.setUserId(history.getUser().getId());
        dto.setAddedCount(history.getAddedCount());
        dto.setTimestamp(history.getTimestamp());
        dto.setErrorMessage(history.getErrorMessage());
        dto.setFileName(history.getFileName());
        dto.setMinioObjectName(history.getMinioObjectName());
        dto.setFileAvailable(history.getMinioObjectName() != null && 
                            !history.getMinioObjectName().isEmpty());
        return dto;
    }
}
