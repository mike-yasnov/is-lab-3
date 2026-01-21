package ru.itmo.is.lab1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

@Entity
@Table(name = "organization")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Cacheable
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Organization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "official_address_id")
    private Address officialAddress;

    @Positive(message = "Годовой оборот должен быть больше 0")
    @Column(nullable = false)
    private int annualTurnover;

    @Positive(message = "Количество сотрудников должно быть больше 0")
    @Column(nullable = false)
    private long employeesCount;

    @NotNull(message = "Рейтинг не может быть null")
    @Positive(message = "Рейтинг должен быть больше 0")
    @Column(nullable = false)
    private Long rating;

    @Enumerated(EnumType.STRING)
    @Column
    private OrganizationType type;

    @NotNull(message = "Почтовый адрес не может быть null")
    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "postal_address_id", nullable = false)
    private Address postalAddress;
}
