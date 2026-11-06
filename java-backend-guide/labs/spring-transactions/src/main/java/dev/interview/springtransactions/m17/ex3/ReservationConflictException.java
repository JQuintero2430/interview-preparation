package dev.interview.springtransactions.m17.ex3;

/** Concurrent writers kept winning after every retry; the caller may try again later. */
public class ReservationConflictException extends RuntimeException {

    public ReservationConflictException(long itemId, Throwable lastConflict) {
        super("Item %d: still conflicting after the last retry".formatted(itemId), lastConflict);
    }
}
