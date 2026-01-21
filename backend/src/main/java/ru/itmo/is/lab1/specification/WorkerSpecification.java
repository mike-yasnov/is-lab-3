package ru.itmo.is.lab1.specification;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import ru.itmo.is.lab1.entity.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class WorkerSpecification {

    public static Specification<Worker> filterByFields(Map<String, String> filters) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filters != null && !filters.isEmpty()) {
                filters.forEach((field, value) -> {
                    if (value != null && !value.trim().isEmpty()) {
                        String pattern = "%" + value.toLowerCase() + "%";
                        
                        switch (field) {
                            case "name":
                                predicates.add(criteriaBuilder.like(
                                    criteriaBuilder.lower(root.get("name")), pattern
                                ));
                                break;
                            case "position":
                                predicates.add(criteriaBuilder.like(
                                    criteriaBuilder.lower(root.get("position").as(String.class)), pattern
                                ));
                                break;
                            case "status":
                                predicates.add(criteriaBuilder.like(
                                    criteriaBuilder.lower(root.get("status").as(String.class)), pattern
                                ));
                                break;
                            case "salary":
                                try {
                                    Long salaryValue = Long.parseLong(value);
                                    predicates.add(criteriaBuilder.equal(root.get("salary"), salaryValue));
                                } catch (NumberFormatException ignored) {
                                    // Игнорируем неверный формат
                                }
                                break;
                            case "rating":
                                try {
                                    Integer ratingValue = Integer.parseInt(value);
                                    predicates.add(criteriaBuilder.equal(root.get("rating"), ratingValue));
                                } catch (NumberFormatException ignored) {
                                    // Игнорируем неверный формат
                                }
                                break;
                            default:
                                // Игнорируем неизвестные поля
                                break;
                        }
                    }
                });
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Worker> filterByName(String name) {
        return (root, query, criteriaBuilder) -> {
            if (name == null || name.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            String pattern = "%" + name.toLowerCase() + "%";
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), pattern);
        };
    }

    public static Specification<Worker> filterByPosition(String position) {
        return (root, query, criteriaBuilder) -> {
            if (position == null || position.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            String pattern = "%" + position.toLowerCase() + "%";
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("position").as(String.class)), pattern);
        };
    }

    public static Specification<Worker> filterByStatus(String status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null || status.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            String pattern = "%" + status.toLowerCase() + "%";
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("status").as(String.class)), pattern);
        };
    }
}


