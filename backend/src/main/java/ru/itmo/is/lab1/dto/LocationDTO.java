package ru.itmo.is.lab1.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationDTO {
    private Long id;

    @NotNull(message = "Координата X не может быть null")
    private Integer x;

    @NotNull(message = "Координата Y не может быть null")
    private Long y;

    @NotNull(message = "Название локации не может быть null")
    @Size(max = 969, message = "Длина названия локации не должна быть больше 969")
    private String name;
}

