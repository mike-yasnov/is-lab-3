package ru.itmo.is.lab1.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Конфигурация JPA с Hibernate.
 * 
 * HikariCP настраивается автоматически через spring.datasource.hikari в application.yml
 * L2 Cache с Ehcache настраивается через spring.jpa.properties.hibernate.cache в application.yml
 */
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(basePackages = "ru.itmo.is.lab1.repository")
public class JpaConfig {
    // Конфигурация HikariCP и L2 Cache настроена в application.yml
    // Hibernate и Spring Boot автоматически настраивают все компоненты
}
