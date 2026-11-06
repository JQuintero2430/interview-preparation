package dev.interview.springtransactions.m17.ex3;

/** A business refusal: retrying will not help. */
public class OutOfStockException extends RuntimeException {

    public OutOfStockException(long itemId, int requested, int available) {
        super("Item %d: requested %d, available %d".formatted(itemId, requested, available));
    }
}
