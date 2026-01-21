package ru.itmo.is.lab1.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.itmo.is.lab1.aop.CacheStatisticsAspect;

import java.util.Map;

/**
 * Контроллер для управления и мониторинга L2 JPA Cache.
 */
@RestController
@RequestMapping("/api/cache")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CacheController {

    private final CacheStatisticsAspect cacheStatisticsAspect;

    /**
     * Получить текущую статистику кэша.
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CacheStatisticsAspect.CacheStatisticsDTO> getStatistics() {
        return ResponseEntity.ok(cacheStatisticsAspect.getCacheStatistics());
    }

    /**
     * Вывести полную статистику в лог и вернуть её.
     */
    @PostMapping("/statistics/log")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CacheStatisticsAspect.CacheStatisticsDTO> logStatistics() {
        cacheStatisticsAspect.logFullStatistics();
        return ResponseEntity.ok(cacheStatisticsAspect.getCacheStatistics());
    }

    /**
     * Сбросить статистику кэша.
     */
    @PostMapping("/statistics/clear")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> clearStatistics() {
        cacheStatisticsAspect.clearStatistics();
        return ResponseEntity.ok(Map.of("message", "Статистика кэша сброшена"));
    }

    /**
     * Получить статус логирования.
     */
    @GetMapping("/logging/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> getLoggingStatus() {
        return ResponseEntity.ok(Map.of("enabled", cacheStatisticsAspect.isStatisticsEnabled()));
    }

    /**
     * Включить логирование статистики кэша.
     */
    @PostMapping("/logging/enable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> enableLogging() {
        cacheStatisticsAspect.setStatisticsEnabled(true);
        return ResponseEntity.ok(Map.of("message", "Логирование статистики кэша включено"));
    }

    /**
     * Отключить логирование статистики кэша.
     */
    @PostMapping("/logging/disable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> disableLogging() {
        cacheStatisticsAspect.setStatisticsEnabled(false);
        return ResponseEntity.ok(Map.of("message", "Логирование статистики кэша отключено"));
    }
}

