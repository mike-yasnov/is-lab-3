package ru.itmo.is.lab1.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.itmo.is.lab1.entity.OrganizationType;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationDTO {
    private Long id;

    private AddressDTO officialAddress;

    @Positive(message = "Годовой оборот должен быть больше 0")
    private Integer annualTurnover;

    @Positive(message = "Количество сотрудников должно быть больше 0")
    private Long employeesCount;

    @NotNull(message = "Рейтинг не может быть null")
    @Positive(message = "Рейтинг должен быть больше 0")
    private Long rating;

    private OrganizationType type;

    @NotNull(message = "Почтовый адрес не может быть null")
    private AddressDTO postalAddress;
}

