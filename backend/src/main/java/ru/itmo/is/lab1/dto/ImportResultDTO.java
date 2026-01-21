package ru.itmo.is.lab1.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.itmo.is.lab1.entity.ImportStatus;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportResultDTO {
    private Long importId;
    private ImportStatus status;
    private Integer addedCount;
    private String errorMessage;
    private List<WorkerDTO> workers;
}

