package dev.interview.javalanguage.m01.ex2.broken;

/** Intentionally defective starting code for Ex01.2; do not copy. */
public final class ShippingCalculator {

    private static final String STANDARD = "STANDARD";
    private static final String EXPRESS = "EXPRESS";
    private static final String PICKUP = "PICKUP";
    private static final int GRAMS_PER_KG = 1000;

    private ShippingCalculator() {}

    public static long costCents(String method, int weightGrams) {
        // Defect: negative weights are never validated.
        int startedKg = Math.ceilDiv(weightGrams, GRAMS_PER_KG);
        // Defect: names are matched as raw strings, so case and whitespace variants fail.
        return switch (method) {
            case STANDARD -> 499 + 100L * startedKg;
            case EXPRESS -> 999 + 250L * startedKg;
            case PICKUP -> 0;
            // Defect: unknown names escape as exceptions, and a new method is silently forgotten.
            default -> throw new IllegalArgumentException("Unknown shipping method: " + method);
        };
    }
}
