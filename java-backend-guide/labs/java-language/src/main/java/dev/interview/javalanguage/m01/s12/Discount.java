package dev.interview.javalanguage.m01.s12;

import java.util.Arrays;
import java.util.Optional;

// Module 01 §12: constant bodies make each constant its own strategy. parse scans values() instead of catching
// valueOf's IllegalArgumentException, so untrusted input never uses an exception for control flow.
public enum Discount {
    NONE("no discount") {
        @Override
        long apply(long cents) {
            return cents;
        }
    },
    PERCENT_TEN("ten percent off") {
        @Override
        long apply(long cents) {
            return cents - cents / 10;
        }
    },
    FLAT_FIVE("five off") {
        @Override
        long apply(long cents) {
            return Math.max(0, cents - FLAT_FIVE_CENTS);
        }
    };

    private static final long FLAT_FIVE_CENTS = 500;
    private final String label;

    Discount(String label) {
        this.label = label;
    }

    abstract long apply(long cents);

    public String label() {
        return label;
    }

    public static Optional<Discount> parse(String raw) {
        if (raw == null) {
            return Optional.empty();
        }
        return Arrays.stream(values())
                .filter(d -> d.name().equalsIgnoreCase(raw.strip()))
                .findFirst();
    }
}
