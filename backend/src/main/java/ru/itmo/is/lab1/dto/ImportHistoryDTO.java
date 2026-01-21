package ru.itmo.is.lab1.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.itmo.is.lab1.entity.ImportStatus;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportHistoryDTO {
    private Long id;
    private ImportStatus status;
    private String username;
    private Long userId;
    private Integer addedCount;
    private LocalDateTime timestamp;
    private String errorMessage;
    private String fileName;
    private String minioObjectName;
    private boolean fileAvailable;
}
