package ru.itmo.is.lab1.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.itmo.is.lab1.entity.Worker;

import ru.itmo.is.lab1.entity.Position;

import java.util.Date;
import java.util.List;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long>, JpaSpecificationExecutor<Worker> {
    
    List<Worker> findByNameStartingWith(String prefix);
    
    List<Worker> findByRating(Integer rating);
    
    List<Worker> findByOrganizationId(Long organizationId);
    
    long countByOrganizationId(Long organizationId);
    
    Page<Worker> findAll(Pageable pageable);
    
    // Для проверки уникальности имени и даты начала работы
    @Query("SELECT w FROM Worker w WHERE w.name = :name AND w.startDate = :startDate")
    List<Worker> findByNameAndStartDate(@Param("name") String name, @Param("startDate") Date startDate);
    
    // Для проверки уникальности имя + должность + организация
    @Query("SELECT w FROM Worker w WHERE w.name = :name AND w.position = :position AND w.organization.id = :orgId")
    List<Worker> findByNameAndPositionAndOrganizationId(
            @Param("name") String name, 
            @Param("position") Position position, 
            @Param("orgId") Long orgId);
}

