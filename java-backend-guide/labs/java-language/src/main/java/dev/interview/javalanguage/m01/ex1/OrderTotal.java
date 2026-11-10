package dev.interview.javalanguage.m01.ex1;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Currency;
import java.util.List;
import java.util.Objects;

public final class OrderTotal {

    private static final int MONEY_SCALE = 2;

    private final Currency currency;
    private final BigDecimal discountRate;

    public OrderTotal(Currency currency, BigDecimal discountRate) {
        this.currency = Objects.requireNonNull(currency, "currency must not be null");
        this.discountRate = Objects.requireNonNull(discountRate, "discountRate must not be null");
    }

    public BigDecimal lineTotal(OrderLine line) {
        if (!currency.equals(line.currency())) {
            throw new IllegalArgumentException(
                    "Line currency " + line.currency().getCurrencyCode() + " does not match order currency "
                            + currency.getCurrencyCode());
        }
        return BigDecimal.valueOf(line.grossCents(), MONEY_SCALE)
                .multiply(BigDecimal.ONE.subtract(discountRate))
                .setScale(MONEY_SCALE, RoundingMode.HALF_EVEN);
    }

    public BigDecimal total(List<OrderLine> lines) {
        return lines.stream().map(this::lineTotal).reduce(BigDecimal.ZERO.setScale(MONEY_SCALE), BigDecimal::add);
    }
}
