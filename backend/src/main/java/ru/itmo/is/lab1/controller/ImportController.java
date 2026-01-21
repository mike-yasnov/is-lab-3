package ru.itmo.is.lab1.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.itmo.is.lab1.dto.ImportHistoryDTO;
import ru.itmo.is.lab1.dto.ImportResultDTO;
import ru.itmo.is.lab1.dto.PageResponse;
import ru.itmo.is.lab1.entity.Role;
import ru.itmo.is.lab1.security.CustomUserDetails;
import ru.itmo.is.lab1.service.ImportService;

import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/import")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ImportController {

    private final ImportService importService;

    @PostMapping("/workers")
    public ResponseEntity<ImportResultDTO> importWorkers(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (file.isEmpty()) {
            throw new RuntimeException("Файл не может быть пустым");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/json")) {
            // Также разрешаем файлы с расширением .json
            String filename = file.getOriginalFilename();
            if (filename == null || !filename.toLowerCase().endsWith(".json")) {
                throw new RuntimeException("Поддерживается только JSON формат файла");
            }
        }

        ImportResultDTO result = importService.importWorkers(file, userDetails.getUserId());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    public ResponseEntity<PageResponse<ImportHistoryDTO>> getImportHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        boolean isAdmin = userDetails.getUser().getRole() == Role.ADMIN;
        
        PageResponse<ImportHistoryDTO> response = importService.getImportHistory(
                userDetails.getUserId(),
                isAdmin,
                pageable
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * Скачивание файла импорта из MinIO.
     */
    @GetMapping("/history/{id}/download")
    public ResponseEntity<InputStreamResource> downloadImportFile(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            boolean isAdmin = userDetails.getUser().getRole() == Role.ADMIN;
            
            // Получаем имя файла
            String fileName = importService.getImportFileName(id);
            
            // Получаем поток файла
            InputStream fileStream = importService.getImportFile(
                    id, 
                    userDetails.getUserId(), 
                    isAdmin
            );

            // Кодируем имя файла для заголовка Content-Disposition
            String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8)
                    .replace("+", "%20");

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename*=UTF-8''" + encodedFileName)
                    .body(new InputStreamResource(fileStream));

        } catch (Exception e) {
            log.error("Ошибка скачивания файла: ", e);
            throw new RuntimeException("Ошибка скачивания файла: " + e.getMessage());
        }
    }
}
