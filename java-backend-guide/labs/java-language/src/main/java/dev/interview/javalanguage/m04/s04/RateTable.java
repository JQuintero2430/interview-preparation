package dev.interview.javalanguage.m04.s04;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Map;
import java.util.NavigableMap;
import java.util.TreeMap;

/**
 * Tiered rates looked up by amount: each band starts at its lower bound and runs up to the next one. A
 * {@code TreeMap} finds the band with one {@code floorEntry} call, in O(log n), and compares the
 * {@code BigDecimal} bounds with {@code compareTo}, so {@code 1000} and {@code 1000.00} are the same bound.
 */
public final class RateTable {

    private final NavigableMap<BigDecimal, BigDecimal> ratesByLowerBound;

    public RateTable(Map<BigDecimal, BigDecimal> ratesByLowerBound) {
        if (ratesByLowerBound.isEmpty()) {
            throw new IllegalArgumentException("a rate table needs at least one band");
        }
        this.ratesByLowerBound = Collections.unmodifiableNavigableMap(new TreeMap<>(ratesByLowerBound));
    }

    public BigDecimal rateFor(BigDecimal amount) {
        Map.Entry<BigDecimal, BigDecimal> band = ratesByLowerBound.floorEntry(amount);
        if (band == null) {
            throw new IllegalArgumentException("no band covers " + amount);
        }
        return band.getValue();
    }
}
