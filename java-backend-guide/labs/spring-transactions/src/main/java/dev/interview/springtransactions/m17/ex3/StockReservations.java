package dev.interview.springtransactions.m17.ex3;

import java.time.Duration;
import org.springframework.core.retry.RetryPolicy;
import org.springframework.core.retry.RetryTemplate;
import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.stereotype.Service;

/** Non-transactional facade: each retry calls the proxy again, so each attempt runs in a new transaction. */
@Service
public class StockReservations {

    public static final int MAX_RETRIES = 3;
    private static final Duration RETRY_DELAY = Duration.ofMillis(10);

    private final OptimisticReservation reservation;
    private final RetryTemplate retryTemplate = new RetryTemplate(RetryPolicy.builder()
            .includes(ConcurrencyFailureException.class)
            .maxRetries(MAX_RETRIES)
            .delay(RETRY_DELAY)
            .build());

    public StockReservations(OptimisticReservation reservation) {
        this.reservation = reservation;
    }

    public void reserve(long itemId, int units) {
        try {
            retryTemplate.invoke(() -> reservation.reserve(itemId, units));
        } catch (ConcurrencyFailureException conflict) {
            throw new ReservationConflictException(itemId, conflict);
        }
    }
}
