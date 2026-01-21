package ru.itmo.is.lab1.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.itmo.is.lab1.dto.PageResponse;
import ru.itmo.is.lab1.dto.WorkerDTO;
import ru.itmo.is.lab1.service.WorkerService;

import java.util.List;

@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorkerController {

    private final WorkerService workerService;

    @GetMapping
    public ResponseEntity<PageResponse<WorkerDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection,
            @RequestParam(required = false) String filterName,
            @RequestParam(required = false) String filterPosition,
            @RequestParam(required = false) String filterStatus
    ) {
        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Pageable pageable = sortBy != null 
                ? PageRequest.of(page, size, Sort.by(direction, sortBy))
                : PageRequest.of(page, size);
        
        PageResponse<WorkerDTO> response = workerService.getAll(pageable, filterName, filterPosition, filterStatus);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkerDTO> getById(@PathVariable Long id) {
        WorkerDTO worker = workerService.getById(id);
        return ResponseEntity.ok(worker);
    }

    @PostMapping
    public ResponseEntity<WorkerDTO> create(@Valid @RequestBody WorkerDTO workerDTO) {
        WorkerDTO created = workerService.create(workerDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkerDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody WorkerDTO workerDTO
    ) {
        WorkerDTO updated = workerService.update(id, workerDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        workerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Специальные операции

    @DeleteMapping("/by-rating/{rating}")
    public ResponseEntity<Void> deleteByRating(@PathVariable Integer rating) {
        workerService.deleteByRating(rating);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/rating/sum")
    public ResponseEntity<Long> sumRating() {
        Long sum = workerService.sumRating();
        return ResponseEntity.ok(sum);
    }

    @GetMapping("/search/by-name")
    public ResponseEntity<List<WorkerDTO>> findByNameStartingWith(
            @RequestParam String prefix
    ) {
        List<WorkerDTO> workers = workerService.findByNameStartingWith(prefix);
        return ResponseEntity.ok(workers);
    }

    @PostMapping("/{workerId}/hire/{organizationId}")
    public ResponseEntity<WorkerDTO> hireToOrganization(
            @PathVariable Long workerId,
            @PathVariable Long organizationId
    ) {
        WorkerDTO worker = workerService.hireToOrganization(workerId, organizationId);
        return ResponseEntity.ok(worker);
    }

    @PostMapping("/{workerId}/index-salary")
    public ResponseEntity<WorkerDTO> indexSalary(
            @PathVariable Long workerId,
            @RequestParam Double coefficient
    ) {
        WorkerDTO worker = workerService.indexSalary(workerId, coefficient);
        return ResponseEntity.ok(worker);
    }
}

