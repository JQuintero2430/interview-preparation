package dev.interview.springtransactions.m17.ex3;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** The alternative: lock the row before reading it, so concurrent callers wait instead of failing. */
@Service
public class PessimisticReservation {

    private final EntityManager entityManager;

    public PessimisticReservation(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional
    public void reserve(long itemId, int units) {
        entityManager
                .find(StockItem.class, itemId, LockModeType.PESSIMISTIC_WRITE)
                .reserve(units);
    }
}
