package dev.interview.javalanguage.m01.ex1;

import java.util.Currency;
import java.util.Objects;

public record OrderLine(String sku, Integer quantity, long unitPriceCents, Currency currency) {

    public OrderLine {
        Objects.requireNonNull(sku, "sku must not be null");
        Objects.requireNonNull(currency, "currency must not be null");
        Objects.requireNonNull(quantity, "quantity must not be null");
    }

    /** Gross in cents; throws ArithmeticException instead of wrapping silently. */
    public long grossCents() {
        return Math.multiplyExact(quantity.longValue(), unitPriceCents);
    }
}
