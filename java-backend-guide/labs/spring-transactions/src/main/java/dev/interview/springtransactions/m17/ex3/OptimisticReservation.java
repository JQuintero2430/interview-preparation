package dev.interview.springtransactions.m17.ex3;

import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** One attempt: read the row with its version; the commit fails if another transaction changed it meanwhile. */
@Service
public class OptimisticReservation {

    private final EntityManager entityManager;

    public OptimisticReservation(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional
    public void reserve(long itemId, int units) {
        entityManager.find(StockItem.class, itemId).reserve(units);
    }
}
