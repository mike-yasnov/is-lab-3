package ru.itmo.is.lab1.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressDTO {
    private Long id;

    @Size(max = 113, message = "Длина улицы не должна быть больше 113")
    private String street;

    @NotNull(message = "Почтовый индекс не может быть null")
    private String zipCode;
}

