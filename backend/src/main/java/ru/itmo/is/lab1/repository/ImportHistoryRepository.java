package ru.itmo.is.lab1.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.itmo.is.lab1.entity.ImportHistory;
import ru.itmo.is.lab1.entity.User;

@Repository
public interface ImportHistoryRepository extends JpaRepository<ImportHistory, Long> {
    Page<ImportHistory> findByUser(User user, Pageable pageable);
    Page<ImportHistory> findByUserId(Long userId, Pageable pageable);
}

