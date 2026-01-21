package ru.itmo.is.lab1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import java.time.LocalDateTime;

@Entity
@Table(name = "import_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Cacheable
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class ImportHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Пользователь не может быть null")
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Статус не может быть null")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ImportStatus status;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "added_count")
    private Integer addedCount;

    @Column(name = "error_message", length = 2000)
    private String errorMessage;

    @Column(name = "file_name")
    private String fileName;

    // Поле для хранения пути к файлу в MinIO
    @Column(name = "minio_object_name")
    private String minioObjectName;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
