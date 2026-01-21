package ru.itmo.is.lab1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.itmo.is.lab1.entity.Coordinates;

@Repository
public interface CoordinatesRepository extends JpaRepository<Coordinates, Long> {
}

