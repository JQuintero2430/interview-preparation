package dev.interview.javalanguage.m01.s10;

// Module 01 §10: RATE_PERCENT is a literal-initialised constant, so javac inlines it into callers; the private
// constructor and final class stop anyone instantiating or subclassing a pure utility, as with java.lang.Math.
public final class Tax {

    public static final int RATE_PERCENT = 21;

    private static final int PERCENT_DIVISOR = 100;

    private Tax() {}

    // multiplyExact throws on overflow instead of returning a wrapped, silently wrong tax.
    public static long taxCents(long netCents) {
        return Math.multiplyExact(netCents, RATE_PERCENT) / PERCENT_DIVISOR;
    }
}
