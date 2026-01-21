package ru.itmo.is.lab1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import java.time.LocalDate;
import java.util.Date;

@Entity
@Table(name = "worker")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Cacheable
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Worker {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Positive(message = "ID должен быть больше 0")
    private Long id;

    @NotNull(message = "Имя не может быть null")
    @NotBlank(message = "Имя не может быть пустым")
    @Column(nullable = false)
    private String name;

    @NotNull(message = "Координаты не могут быть null")
    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "coordinates_id", nullable = false)
    private Coordinates coordinates;

    @NotNull(message = "Дата создания не может быть null")
    @Column(nullable = false, updatable = false)
    private LocalDate creationDate;

    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @Positive(message = "Зарплата должна быть больше 0")
    @Column(nullable = false)
    private long salary;

    @Positive(message = "Рейтинг должен быть больше 0")
    @Column
    private Integer rating;

    @NotNull(message = "Дата начала работы не может быть null")
    @Temporal(TemporalType.DATE)
    @Column(nullable = false)
    private Date startDate;

    @Enumerated(EnumType.STRING)
    @Column
    private Position position;

    @Enumerated(EnumType.STRING)
    @Column
    private Status status;

    @NotNull(message = "Персона не может быть null")
    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    @PrePersist
    protected void onCreate() {
        creationDate = LocalDate.now();
    }
}
