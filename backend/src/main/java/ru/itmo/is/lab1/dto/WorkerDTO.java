package ru.itmo.is.lab1.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.itmo.is.lab1.entity.Position;
import ru.itmo.is.lab1.entity.Status;

import java.time.LocalDate;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkerDTO {
    private Long id;

    @NotNull(message = "Имя не может быть null")
    @NotBlank(message = "Имя не может быть пустым")
    private String name;

    @NotNull(message = "Координаты не могут быть null")
    private CoordinatesDTO coordinates;

    private LocalDate creationDate;

    private OrganizationDTO organization;

    @Positive(message = "Зарплата должна быть больше 0")
    private Long salary;

    @Positive(message = "Рейтинг должен быть больше 0")
    private Integer rating;

    @NotNull(message = "Дата начала работы не может быть null")
    private Date startDate;

    private Position position;

    private Status status;

    @NotNull(message = "Персона не может быть null")
    private PersonDTO person;
}

