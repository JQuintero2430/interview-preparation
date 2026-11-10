package dev.interview.javalanguage.m01.ex1.broken;

import java.util.List;

/** Intentionally defective starting code for Ex01.1; do not copy. */
public final class OrderTotal {

    private static final double CENTS_PER_UNIT = 100.0;

    private OrderTotal() {}

    public record Line(String sku, Integer quantity, long unitPriceCents, String currencyCode) {}

    public static double total(List<Line> lines, double discountRate) {
        double total = 0;
        for (Line line : lines) {
            // Defect: unboxing a null quantity throws an opaque NullPointerException.
            int q = line.quantity();
            // Defect: int * long silently wraps on overflow.
            long gross = q * line.unitPriceCents();
            // Defect: binary double cannot represent cents exactly; no per-line rounding.
            total += gross / CENTS_PER_UNIT * (1 - discountRate);
            // Defect: currencyCode is never compared, so mixed currencies are summed.
        }
        return total;
    }
}
