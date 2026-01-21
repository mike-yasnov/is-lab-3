package ru.itmo.is.lab1.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.is.lab1.dto.PageResponse;
import ru.itmo.is.lab1.dto.WorkerDTO;
import ru.itmo.is.lab1.entity.Organization;
import ru.itmo.is.lab1.entity.Worker;
import ru.itmo.is.lab1.repository.OrganizationRepository;
import ru.itmo.is.lab1.repository.WorkerRepository;
import ru.itmo.is.lab1.specification.WorkerSpecification;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkerService {

    private final WorkerRepository workerRepository;
    private final OrganizationRepository organizationRepository;
    private final MapperService mapperService;
    private final SimpMessagingTemplate messagingTemplate;
    private final WorkerValidationService validationService;

    @Transactional(readOnly = true)
    public WorkerDTO getById(Long id) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Работник с ID " + id + " не найден"));
        return mapperService.toDTO(worker);
    }

    @Transactional(readOnly = true)
    public PageResponse<WorkerDTO> getAll(Pageable pageable) {
        Page<Worker> page = workerRepository.findAll(pageable);
        
        List<WorkerDTO> content = page.getContent().stream()
                .map(mapperService::toDTO)
                .collect(Collectors.toList());
        
        PageResponse<WorkerDTO> response = new PageResponse<>();
        response.setContent(content);
        response.setPageNumber(page.getNumber());
        response.setPageSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLast(page.isLast());
        response.setFirst(page.isFirst());
        
        return response;
    }

    @Transactional(readOnly = true)
    public PageResponse<WorkerDTO> getAll(Pageable pageable, String filterName, String filterPosition, String filterStatus) {
        Specification<Worker> spec = Specification.where(null);
        
        if (filterName != null && !filterName.trim().isEmpty()) {
            spec = spec.and(WorkerSpecification.filterByName(filterName));
        }
        
        if (filterPosition != null && !filterPosition.trim().isEmpty()) {
            spec = spec.and(WorkerSpecification.filterByPosition(filterPosition));
        }
        
        if (filterStatus != null && !filterStatus.trim().isEmpty()) {
            spec = spec.and(WorkerSpecification.filterByStatus(filterStatus));
        }
        
        Page<Worker> page = workerRepository.findAll(spec, pageable);
        
        List<WorkerDTO> content = page.getContent().stream()
                .map(mapperService::toDTO)
                .collect(Collectors.toList());
        
        PageResponse<WorkerDTO> response = new PageResponse<>();
        response.setContent(content);
        response.setPageNumber(page.getNumber());
        response.setPageSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLast(page.isLast());
        response.setFirst(page.isFirst());
        
        return response;
    }

    @Transactional
    public WorkerDTO create(WorkerDTO workerDTO) {
        // Валидация бизнес-правил уникальности
        validationService.validateWorker(workerDTO, null);
        
        Worker worker = mapperService.toEntity(workerDTO);
        worker.setId(null); 
        if (worker.getOrganization() != null && worker.getOrganization().getId() != null) {
            Organization existingOrg = organizationRepository.findById(worker.getOrganization().getId())
                .orElseThrow(() -> new RuntimeException("Организация с ID " + worker.getOrganization().getId() + " не найдена"));
            worker.setOrganization(existingOrg);
        }
        
        Worker savedWorker = workerRepository.save(worker);
        WorkerDTO result = mapperService.toDTO(savedWorker);
        
        messagingTemplate.convertAndSend("/topic/workers/created", result);
        
        return result;
    }

    @Transactional
    public WorkerDTO update(Long id, WorkerDTO workerDTO) {
        Worker existingWorker = workerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Работник с ID " + id + " не найден"));
        
        // Валидация бизнес-правил уникальности (исключая текущего работника)
        validationService.validateWorker(workerDTO, id);
        
        Worker updatedWorker = mapperService.toEntity(workerDTO);
        updatedWorker.setId(id);
        updatedWorker.setCreationDate(existingWorker.getCreationDate());
        
        if (updatedWorker.getOrganization() != null && updatedWorker.getOrganization().getId() != null) {
            Organization existingOrg = organizationRepository.findById(updatedWorker.getOrganization().getId())
                .orElseThrow(() -> new RuntimeException("Организация с ID " + updatedWorker.getOrganization().getId() + " не найдена"));
            updatedWorker.setOrganization(existingOrg);
        }
        
        Worker savedWorker = workerRepository.save(updatedWorker);
        WorkerDTO result = mapperService.toDTO(savedWorker);
        
        messagingTemplate.convertAndSend("/topic/workers/updated", result);
        
        return result;
    }

    @Transactional
    public void delete(Long id) {
        if (!workerRepository.existsById(id)) {
            throw new EntityNotFoundException("Работник с ID " + id + " не найден");
        }
        workerRepository.deleteById(id);
        
        messagingTemplate.convertAndSend("/topic/workers/deleted", id);
    }

    @Transactional
    public void deleteByRating(Integer rating) {
        List<Worker> workers = workerRepository.findByRating(rating);
        workerRepository.deleteAll(workers);
        
        workers.forEach(worker ->
            messagingTemplate.convertAndSend("/topic/workers/deleted", worker.getId())
        );
    }

    @Transactional(readOnly = true)
    public Long sumRating() {
        List<Worker> workers = workerRepository.findAll();
        return workers.stream()
                .filter(w -> w.getRating() != null)
                .mapToLong(Worker::getRating)
                .sum();
    }

    @Transactional(readOnly = true)
    public List<WorkerDTO> findByNameStartingWith(String prefix) {
        List<Worker> workers = workerRepository.findByNameStartingWith(prefix);
        return workers.stream()
                .map(mapperService::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkerDTO hireToOrganization(Long workerId, Long organizationId) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new EntityNotFoundException("Работник с ID " + workerId + " не найден"));
        
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new EntityNotFoundException("Организация с ID " + organizationId + " не найдена"));
        
        // Проверка уникальности: имя + должность + организация
        if (worker.getName() != null && worker.getPosition() != null) {
            List<Worker> duplicates = workerRepository.findByNameAndPositionAndOrganizationId(
                    worker.getName(), worker.getPosition(), organizationId);
            
            boolean hasDuplicate = duplicates.stream()
                    .anyMatch(w -> !w.getId().equals(workerId));
            
            if (hasDuplicate) {
                throw new RuntimeException(
                        "Работник '" + worker.getName() + "' уже занимает должность " + 
                        worker.getPosition() + " в данной организации. " +
                        "Один человек не может занимать одну должность в одной организации дважды.");
            }
        }
        
        // Принимаем работника на работу: устанавливаем организацию и статус PROBATION
        worker.setOrganization(organization);
        worker.setStatus(ru.itmo.is.lab1.entity.Status.PROBATION);
        
        Worker savedWorker = workerRepository.save(worker);
        WorkerDTO result = mapperService.toDTO(savedWorker);
        
        messagingTemplate.convertAndSend("/topic/workers/updated", result);
        
        return result;
    }

    @Transactional
    public WorkerDTO indexSalary(Long workerId, Double coefficient) {
        if (coefficient == null || coefficient <= 0) {
            throw new IllegalArgumentException("Коэффициент должен быть больше 0");
        }
        
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new EntityNotFoundException("Работник с ID " + workerId + " не найден"));
        
        long newSalary = Math.round(worker.getSalary() * coefficient);
        worker.setSalary(newSalary);
        
        Worker savedWorker = workerRepository.save(worker);
        WorkerDTO result = mapperService.toDTO(savedWorker);
        
        messagingTemplate.convertAndSend("/topic/workers/updated", result);
        
        return result;
    }
}

