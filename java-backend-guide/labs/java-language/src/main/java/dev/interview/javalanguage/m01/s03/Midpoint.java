package dev.interview.javalanguage.m01.s03;

// Binary-search midpoint for module 01 §3: >>> reads the wrapped int sum as unsigned, so it never goes negative.
public final class Midpoint {

    static final String INVALID_RANGE = "need 0 <= low <= high: ";

    private Midpoint() {}

    // Teaching foil: low + high wraps negative past Integer.MAX_VALUE (JLS §15.18.2), and / 2 keeps the sign.
    static int naive(int low, int high) {
        return (low + high) / 2;
    }

    public static int of(int low, int high) {
        if (low < 0 || high < low) {
            throw new IllegalArgumentException(INVALID_RANGE + low + ", " + high);
        }
        // Two non-negative ints sum to at most 2^32 - 2, which fits in 32 unsigned bits; >>> 1 halves it as unsigned.
        return (low + high) >>> 1;
    }
}
