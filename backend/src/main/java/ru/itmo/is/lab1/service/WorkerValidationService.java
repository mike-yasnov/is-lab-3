package ru.itmo.is.lab1.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.is.lab1.dto.WorkerDTO;
import ru.itmo.is.lab1.entity.Worker;
import ru.itmo.is.lab1.repository.WorkerRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Сервис для валидации бизнес-правил уникальности работников.
 * Эти ограничения проверяются на программном уровне и НЕ реализованы в БД.
 */
@Service
@RequiredArgsConstructor
public class WorkerValidationService {

    private final WorkerRepository workerRepository;

    // Кэш для проверки уникальности в рамках одной транзакции импорта
    private final ThreadLocal<Set<String>> importNameCache = ThreadLocal.withInitial(HashSet::new);

    /**
     * Проверяет уникальность имени работника в сочетании с датой начала работы.
     * Бизнес-правило: не может быть двух работников с одинаковым именем и датой начала работы.
     */
    @Transactional(readOnly = true)
    public void validateUniqueNameAndStartDate(WorkerDTO workerDTO, Long excludeId) {
        if (workerDTO.getName() == null || workerDTO.getStartDate() == null) {
            return;
        }

        List<Worker> existingWorkers = workerRepository.findByNameAndStartDate(
                workerDTO.getName(),
                workerDTO.getStartDate()
        );

        boolean hasDuplicate = existingWorkers.stream()
                .anyMatch(w -> excludeId == null || !w.getId().equals(excludeId));

        if (hasDuplicate) {
            throw new RuntimeException(
                    "Работник с именем '" + workerDTO.getName() + 
                    "' и датой начала работы уже существует. " +
                    "Комбинация имени и даты начала работы должна быть уникальной.");
        }
    }

    /**
     * Проверяет уникальность работника в организации по имени и должности.
     * Бизнес-правило: один человек не может занимать одну и ту же должность в одной организации дважды.
     */
    @Transactional(readOnly = true)
    public void validateUniqueNamePositionOrganization(WorkerDTO workerDTO, Long excludeId) {
        if (workerDTO.getName() == null || workerDTO.getPosition() == null || workerDTO.getOrganization() == null) {
            return; // Если нет организации или должности - проверка не применяется
        }

        List<Worker> existingWorkers = workerRepository.findByNameAndPositionAndOrganizationId(
                workerDTO.getName(),
                workerDTO.getPosition(),
                workerDTO.getOrganization().getId()
        );

        boolean hasDuplicate = existingWorkers.stream()
                .anyMatch(w -> excludeId == null || !w.getId().equals(excludeId));

        if (hasDuplicate) {
            throw new RuntimeException(
                    "Работник '" + workerDTO.getName() + "' уже занимает должность " + 
                    workerDTO.getPosition() + " в данной организации. " +
                    "Один человек не может занимать одну должность в одной организации дважды.");
        }
    }

    /**
     * Полная валидация работника при создании/обновлении.
     */
    public void validateWorker(WorkerDTO workerDTO, Long excludeId) {
        validateUniqueNameAndStartDate(workerDTO, excludeId);
        validateUniqueNamePositionOrganization(workerDTO, excludeId);
    }

    /**
     * Валидация работника при импорте с указанием номера строки для сообщений об ошибках.
     */
    public void validateWorkerForImport(WorkerDTO workerDTO, int rowNumber) {
        try {
            // Проверка базовой валидации
            validateBasicFields(workerDTO, rowNumber);
            
            // Проверка уникальности в БД
            validateUniqueNameAndStartDate(workerDTO, null);
            validateUniqueNamePositionOrganization(workerDTO, null);
            
            // Проверка уникальности в рамках текущего импорта
            validateUniqueInCurrentImport(workerDTO, rowNumber);
            
        } catch (RuntimeException e) {
            throw new RuntimeException("Строка " + rowNumber + ": " + e.getMessage());
        }
    }

    /**
     * Проверяет обязательные поля.
     */
    private void validateBasicFields(WorkerDTO workerDTO, int rowNumber) {
        if (workerDTO.getName() == null || workerDTO.getName().isBlank()) {
            throw new RuntimeException("Имя не может быть пустым");
        }
        if (workerDTO.getCoordinates() == null) {
            throw new RuntimeException("Координаты не могут быть null");
        }
        if (workerDTO.getCoordinates().getX() == null) {
            throw new RuntimeException("Координата X не может быть null");
        }
        if (workerDTO.getSalary() == null || workerDTO.getSalary() <= 0) {
            throw new RuntimeException("Зарплата должна быть больше 0");
        }
        if (workerDTO.getStartDate() == null) {
            throw new RuntimeException("Дата начала работы не может быть null");
        }
        if (workerDTO.getPerson() == null) {
            throw new RuntimeException("Персона не может быть null");
        }
        if (workerDTO.getPerson().getEyeColor() == null) {
            throw new RuntimeException("Цвет глаз не может быть null");
        }
        if (workerDTO.getPerson().getHairColor() == null) {
            throw new RuntimeException("Цвет волос не может быть null");
        }
        if (workerDTO.getPerson().getHeight() == null || workerDTO.getPerson().getHeight() <= 0) {
            throw new RuntimeException("Рост должен быть больше 0");
        }
    }

    /**
     * Проверяет уникальность в рамках текущего импорта.
     */
    private void validateUniqueInCurrentImport(WorkerDTO workerDTO, int rowNumber) {
        String nameKey = workerDTO.getName() + "_" + workerDTO.getStartDate().getTime();
        
        Set<String> cache = importNameCache.get();
        
        if (cache.contains("name_" + nameKey)) {
            throw new RuntimeException("Дубликат: работник с таким именем и датой начала работы уже есть в файле импорта");
        }
        
        // Проверка уникальности имя + должность + организация в рамках импорта
        if (workerDTO.getPosition() != null && workerDTO.getOrganization() != null) {
            String posOrgKey = workerDTO.getName() + "_" + workerDTO.getPosition() + "_" + workerDTO.getOrganization().getId();
            if (cache.contains("posorg_" + posOrgKey)) {
                throw new RuntimeException("Дубликат: работник с таким именем и должностью в данной организации уже есть в файле импорта");
            }
            cache.add("posorg_" + posOrgKey);
        }
        
        cache.add("name_" + nameKey);
    }

    /**
     * Очистка кэша после импорта.
     */
    public void clearImportCache() {
        importNameCache.remove();
    }
}

