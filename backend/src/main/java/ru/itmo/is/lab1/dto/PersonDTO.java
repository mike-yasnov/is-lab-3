package ru.itmo.is.lab1.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.itmo.is.lab1.entity.Color;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonDTO {
    private Long id;

    @NotNull(message = "Цвет глаз не может быть null")
    private Color eyeColor;

    @NotNull(message = "Цвет волос не может быть null")
    private Color hairColor;

    private LocationDTO location;

    private LocalDate birthday;

    @Positive(message = "Рост должен быть больше 0")
    private Float height;
}

