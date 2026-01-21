package ru.itmo.is.lab1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.itmo.is.lab1.entity.Location;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
}

