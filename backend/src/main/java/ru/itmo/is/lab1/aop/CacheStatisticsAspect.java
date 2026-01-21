package ru.itmo.is.lab1.aop;

import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * AOP аспект для логирования статистики L2 JPA Cache.
 * Включается/отключается через конфигурацию cache.statistics.enabled.
 * 
 * Логирует:
 * - Cache hits (попадания в кэш)
 * - Cache misses (промахи кэша)
 * - Put count (количество записей в кэш)
 * - Hit ratio (процент попаданий)
 */
@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class CacheStatisticsAspect {

    private final EntityManagerFactory entityManagerFactory;

    @Value("${cache.statistics.enabled:false}")
    private boolean statisticsEnabled;

    /**
     * Pointcut для всех методов репозиториев.
     */
    @Pointcut("execution(* ru.itmo.is.lab1.repository.*.*(..))")
    public void repositoryMethods() {}

    /**
     * Pointcut для всех методов сервисов.
     */
    @Pointcut("execution(* ru.itmo.is.lab1.service.*.*(..))")
    public void serviceMethods() {}

    /**
     * Логирование статистики кэша после вызовов методов репозитория.
     */
    @Around("repositoryMethods()")
    public Object logCacheStatisticsForRepository(ProceedingJoinPoint joinPoint) throws Throwable {
        if (!statisticsEnabled) {
            return joinPoint.proceed();
        }

        Statistics stats = getStatistics();
        long hitsBefore = stats.getSecondLevelCacheHitCount();
        long missesBefore = stats.getSecondLevelCacheMissCount();

        Object result = joinPoint.proceed();

        long hitsAfter = stats.getSecondLevelCacheHitCount();
        long missesAfter = stats.getSecondLevelCacheMissCount();

        long newHits = hitsAfter - hitsBefore;
        long newMisses = missesAfter - missesBefore;

        if (newHits > 0 || newMisses > 0) {
            log.info("[L2 Cache] {}.{}: hits={}, misses={}", 
                    joinPoint.getSignature().getDeclaringType().getSimpleName(),
                    joinPoint.getSignature().getName(),
                    newHits, newMisses);
        }

        return result;
    }

    /**
     * Получает общую статистику кэша.
     */
    public CacheStatisticsDTO getCacheStatistics() {
        Statistics stats = getStatistics();
        
        long hits = stats.getSecondLevelCacheHitCount();
        long misses = stats.getSecondLevelCacheMissCount();
        long puts = stats.getSecondLevelCachePutCount();
        
        double hitRatio = (hits + misses) > 0 ? 
                (double) hits / (hits + misses) * 100 : 0;

        return new CacheStatisticsDTO(
                hits,
                misses,
                puts,
                hitRatio,
                stats.getQueryCacheHitCount(),
                stats.getQueryCacheMissCount(),
                stats.getQueryCachePutCount(),
                statisticsEnabled
        );
    }

    /**
     * Выводит полную статистику кэша в лог.
     */
    public void logFullStatistics() {
        if (!statisticsEnabled) {
            log.info("Логирование статистики кэша отключено");
            return;
        }

        Statistics stats = getStatistics();

        log.info("=== L2 JPA Cache Statistics ===");
        log.info("Second Level Cache:");
        log.info("  - Hits: {}", stats.getSecondLevelCacheHitCount());
        log.info("  - Misses: {}", stats.getSecondLevelCacheMissCount());
        log.info("  - Puts: {}", stats.getSecondLevelCachePutCount());
        
        long hits = stats.getSecondLevelCacheHitCount();
        long misses = stats.getSecondLevelCacheMissCount();
        double hitRatio = (hits + misses) > 0 ? 
                (double) hits / (hits + misses) * 100 : 0;
        log.info("  - Hit Ratio: {:.2f}%", hitRatio);

        log.info("Query Cache:");
        log.info("  - Hits: {}", stats.getQueryCacheHitCount());
        log.info("  - Misses: {}", stats.getQueryCacheMissCount());
        log.info("  - Puts: {}", stats.getQueryCachePutCount());

        log.info("General:");
        log.info("  - Queries Executed: {}", stats.getQueryExecutionCount());
        log.info("  - Entities Loaded: {}", stats.getEntityLoadCount());
        log.info("  - Entities Inserted: {}", stats.getEntityInsertCount());
        log.info("  - Entities Updated: {}", stats.getEntityUpdateCount());
        log.info("  - Entities Deleted: {}", stats.getEntityDeleteCount());
        log.info("================================");
    }

    /**
     * Сбрасывает статистику кэша.
     */
    public void clearStatistics() {
        getStatistics().clear();
        log.info("Статистика кэша сброшена");
    }

    /**
     * Проверяет, включено ли логирование статистики.
     */
    public boolean isStatisticsEnabled() {
        return statisticsEnabled;
    }

    /**
     * Включает/отключает логирование статистики.
     */
    public void setStatisticsEnabled(boolean enabled) {
        this.statisticsEnabled = enabled;
        log.info("Логирование статистики кэша: {}", enabled ? "включено" : "отключено");
    }

    private Statistics getStatistics() {
        SessionFactory sessionFactory = entityManagerFactory.unwrap(SessionFactory.class);
        return sessionFactory.getStatistics();
    }

    /**
     * DTO для передачи статистики кэша.
     */
    public record CacheStatisticsDTO(
            long secondLevelHits,
            long secondLevelMisses,
            long secondLevelPuts,
            double secondLevelHitRatio,
            long queryHits,
            long queryMisses,
            long queryPuts,
            boolean loggingEnabled
    ) {}
}

