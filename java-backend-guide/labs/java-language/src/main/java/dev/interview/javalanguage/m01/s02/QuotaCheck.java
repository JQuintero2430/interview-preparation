package dev.interview.javalanguage.m01.s02;

// Quota guard for module 01 §2: an int sum that wraps turns a huge request into a small one and passes the check.
public final class QuotaCheck {

    static final String NEGATIVE_REQUEST = "requested must not be negative: ";

    private QuotaCheck() {}

    // Teaching foil: used + requested is int arithmetic, so it wraps past Integer.MAX_VALUE (JLS §15.18.2).
    static boolean fitsNaive(int used, int requested, int limit) {
        return used + requested <= limit;
    }

    public static boolean fits(int used, int requested, int limit) {
        if (requested < 0) {
            throw new IllegalArgumentException(NEGATIVE_REQUEST + requested);
        }
        // Widening one operand to long promotes the sum to long, which cannot overflow for two int values.
        return (long) used + requested <= limit;
    }
}
