package dev.interview.springtransactions.m17.s10;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** The same change under optimistic locking (version check at commit) and pessimistic locking (row lock). */
@Service
public class StockService {

    private final EntityManager entityManager;

    public StockService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional
    public void removeOptimistic(long stockId, int units) {
        entityManager.find(Stock.class, stockId).remove(units);
    }

    @Transactional
    public void removeLocked(long stockId, int units) {
        entityManager.find(Stock.class, stockId, LockModeType.PESSIMISTIC_WRITE).remove(units);
    }
}
