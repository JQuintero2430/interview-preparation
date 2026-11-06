package dev.interview.javalanguage.m01.outputs;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/** Q01.06: rounding tax per line versus once per order with BigDecimal. */
public final class Q01_06 {

    private static final int MONEY_SCALE = 2;

    private Q01_06() {}

    public static BigDecimal taxPerLine(List<BigDecimal> lines, BigDecimal rate, RoundingMode mode) {
        return lines.stream()
                .map(line -> line.multiply(rate).setScale(MONEY_SCALE, mode))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public static BigDecimal taxPerOrder(List<BigDecimal> lines, BigDecimal rate, RoundingMode mode) {
        return lines.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .multiply(rate)
                .setScale(MONEY_SCALE, mode);
    }
}
