package dev.interview.javalanguage.m02.ex1;

import java.math.BigDecimal;
import java.util.Currency;
import java.util.Objects;

/** Module 02 Ex02.1: one stored scale per value, so equals, hashCode and compareTo agree in every collection. */
public record Money(BigDecimal amount, Currency currency) implements Comparable<Money> {

    private static final int SCALE = 2;
    private static final String AMOUNT = "amount";
    private static final String CURRENCY = "currency";
    private static final String TOO_MANY_DECIMALS = "amount %s has more than 2 decimal places";
    private static final String CURRENCY_MISMATCH = "cannot compare %s with %s";

    public Money {
        Objects.requireNonNull(amount, AMOUNT);
        Objects.requireNonNull(currency, CURRENCY);
        if (amount.stripTrailingZeros().scale() > SCALE) {
            throw new IllegalArgumentException(TOO_MANY_DECIMALS.formatted(amount));
        }
        // 1.0 and 1.00 are both stored as 1.00, so the generated equals and hashCode see the same component.
        amount = amount.setScale(SCALE);
    }

    @Override
    public int compareTo(Money other) {
        if (!currency.equals(other.currency)) {
            throw new IllegalArgumentException(CURRENCY_MISMATCH.formatted(currency, other.currency));
        }
        return amount.compareTo(other.amount);
    }
}
