package ru.itmo.is.lab1.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoordinatesDTO {
    private Long id;

    @NotNull(message = "Координата X не может быть null")
    @Max(value = 500, message = "Максимальное значение координаты X: 500")
    private Integer x;

    @Max(value = 381, message = "Максимальное значение координаты Y: 381")
    private long y;
}

