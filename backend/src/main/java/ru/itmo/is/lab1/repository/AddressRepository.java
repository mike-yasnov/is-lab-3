package ru.itmo.is.lab1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.itmo.is.lab1.entity.Address;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
}

