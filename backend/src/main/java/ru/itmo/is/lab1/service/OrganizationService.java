package ru.itmo.is.lab1.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.is.lab1.dto.OrganizationDTO;
import ru.itmo.is.lab1.entity.Organization;
import ru.itmo.is.lab1.repository.OrganizationRepository;
import ru.itmo.is.lab1.repository.WorkerRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final WorkerRepository workerRepository;
    private final MapperService mapperService;

    @Transactional(readOnly = true)
    public List<OrganizationDTO> getAll() {
        return organizationRepository.findAll().stream()
                .map(mapperService::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrganizationDTO getById(Long id) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Организация с ID " + id + " не найдена"));
        return mapperService.toDTO(organization);
    }

    @Transactional
    public OrganizationDTO create(OrganizationDTO dto) {
        Organization organization = mapperService.toEntity(dto);
        organization.setId(null);
        Organization saved = organizationRepository.save(organization);
        return mapperService.toDTO(saved);
    }

    @Transactional
    public OrganizationDTO update(Long id, OrganizationDTO dto) {
        Organization existingOrganization = organizationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Организация с ID " + id + " не найдена"));
        
        Organization updatedOrganization = mapperService.toEntity(dto);
        updatedOrganization.setId(id);
        
        Organization saved = organizationRepository.save(updatedOrganization);
        return mapperService.toDTO(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!organizationRepository.existsById(id)) {
            throw new EntityNotFoundException("Организация с ID " + id + " не найдена");
        }
        
        // Проверяем, есть ли работники, связанные с этой организацией
        long workersCount = workerRepository.countByOrganizationId(id);
        if (workersCount > 0) {
            throw new IllegalStateException(
                "Невозможно удалить организацию: с ней связано " + workersCount + " работник(ов). " +
                "Сначала удалите или измените организацию у работников."
            );
        }
        
        organizationRepository.deleteById(id);
    }
}

