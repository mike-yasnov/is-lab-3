package ru.itmo.is.lab1.service;

import io.minio.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Сервис для работы с MinIO (S3-совместимое хранилище).
 * Поддерживает подготовку файлов для двухфазного коммита.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    /**
     * Генерирует уникальное имя объекта для файла.
     */
    public String generateObjectName(String originalFileName, Long userId) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return String.format("imports/%d/%s_%s_%s", userId, timestamp, uuid, originalFileName);
    }

    /**
     * Фаза PREPARE: Загружает файл во временную директорию.
     * Файл помечается как pending и может быть удалён при откате.
     */
    public String prepareUpload(MultipartFile file, Long userId) throws Exception {
        String objectName = generateObjectName(file.getOriginalFilename(), userId);
        String pendingObjectName = "pending/" + objectName;

        try {
            // Сохраняем содержимое файла в байтовый массив
            byte[] fileContent = file.getInputStream().readAllBytes();
            
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(pendingObjectName)
                            .stream(new ByteArrayInputStream(fileContent), fileContent.length, -1)
                            .contentType(file.getContentType())
                            .build()
            );

            log.info("Файл подготовлен к загрузке: {}", pendingObjectName);
            return pendingObjectName;
        } catch (Exception e) {
            log.error("Ошибка подготовки файла в MinIO: {}", e.getMessage());
            throw new MinioOperationException("Ошибка подготовки файла в хранилище", e);
        }
    }

    /**
     * Фаза COMMIT: Перемещает файл из pending в постоянное хранилище.
     */
    public String commitUpload(String pendingObjectName) throws Exception {
        String finalObjectName = pendingObjectName.replace("pending/", "");

        try {
            // Копируем объект в финальное место
            minioClient.copyObject(
                    CopyObjectArgs.builder()
                            .bucket(bucketName)
                            .object(finalObjectName)
                            .source(CopySource.builder()
                                    .bucket(bucketName)
                                    .object(pendingObjectName)
                                    .build())
                            .build()
            );

            // Удаляем pending объект
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(pendingObjectName)
                            .build()
            );

            log.info("Файл закоммичен: {} -> {}", pendingObjectName, finalObjectName);
            return finalObjectName;
        } catch (Exception e) {
            log.error("Ошибка коммита файла в MinIO: {}", e.getMessage());
            throw new MinioOperationException("Ошибка коммита файла в хранилище", e);
        }
    }

    /**
     * Фаза ROLLBACK: Удаляет pending файл при откате транзакции.
     */
    public void rollbackUpload(String pendingObjectName) {
        if (pendingObjectName == null || pendingObjectName.isEmpty()) {
            return;
        }

        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(pendingObjectName)
                            .build()
            );
            log.info("Файл откачен (удалён): {}", pendingObjectName);
        } catch (Exception e) {
            log.error("Ошибка отката файла в MinIO: {}", e.getMessage());
            // При ошибке отката не бросаем исключение, только логируем
        }
    }

    /**
     * Проверяет доступность MinIO.
     */
    public boolean isAvailable() {
        try {
            minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucketName).build()
            );
            return true;
        } catch (Exception e) {
            log.warn("MinIO недоступен: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Получает файл из хранилища.
     */
    public InputStream getFile(String objectName) throws Exception {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
        } catch (Exception e) {
            log.error("Ошибка получения файла из MinIO: {}", e.getMessage());
            throw new MinioOperationException("Ошибка получения файла из хранилища", e);
        }
    }

    /**
     * Удаляет файл из хранилища.
     */
    public void deleteFile(String objectName) throws Exception {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
            log.info("Файл удалён: {}", objectName);
        } catch (Exception e) {
            log.error("Ошибка удаления файла из MinIO: {}", e.getMessage());
            throw new MinioOperationException("Ошибка удаления файла из хранилища", e);
        }
    }

    /**
     * Исключение для операций MinIO.
     */
    public static class MinioOperationException extends RuntimeException {
        public MinioOperationException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}

