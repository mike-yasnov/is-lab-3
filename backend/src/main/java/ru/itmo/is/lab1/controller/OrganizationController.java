package ru.itmo.is.lab1.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.itmo.is.lab1.dto.OrganizationDTO;
import ru.itmo.is.lab1.service.OrganizationService;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping
    public ResponseEntity<List<OrganizationDTO>> getAll() {
        List<OrganizationDTO> organizations = organizationService.getAll();
        return ResponseEntity.ok(organizations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrganizationDTO> getById(@PathVariable Long id) {
        OrganizationDTO organization = organizationService.getById(id);
        return ResponseEntity.ok(organization);
    }

    @PostMapping
    public ResponseEntity<OrganizationDTO> create(@Valid @RequestBody OrganizationDTO organizationDTO) {
        OrganizationDTO created = organizationService.create(organizationDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrganizationDTO> update(@PathVariable Long id, @Valid @RequestBody OrganizationDTO organizationDTO) {
        OrganizationDTO updated = organizationService.update(id, organizationDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        organizationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

