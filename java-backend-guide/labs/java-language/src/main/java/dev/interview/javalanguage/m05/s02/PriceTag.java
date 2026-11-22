package dev.interview.javalanguage.m05.s02;

import java.util.function.IntSupplier;

// A field read in a lambda goes through the captured this; a local is copied when the lambda is evaluated.
public final class PriceTag {

    private int cents;

    public PriceTag(int cents) {
        this.cents = cents;
    }

    public void reprice(int newCents) {
        this.cents = newCents;
    }

    // Captures this: every call reads the field as it is at that moment.
    public IntSupplier currentPrice() {
        return () -> cents;
    }

    // Captures a copy of the local: the value it had when the lambda was evaluated.
    public IntSupplier priceAtCreation() {
        int snapshot = cents;
        return () -> snapshot;
    }
}
