package dev.interview.javalanguage.m03.s03;

import java.util.Iterator;
import java.util.List;

// Module 03 §3: one method per kind of bound. The bound is what lets each body call a method on a T.
public final class Bounds {

    private Bounds() {}

    public static <T extends Number> double sum(List<T> values) {
        double total = 0.0;
        for (T value : values) {
            total += value.doubleValue();
        }
        return total;
    }

    public static <T extends Number & Comparable<T>> T clamp(T value, T low, T high) {
        if (value.compareTo(low) < 0) {
            return low;
        }
        if (value.compareTo(high) > 0) {
            return high;
        }
        return value;
    }

    public static <T extends Comparable<? super T>> T max(List<T> values) {
        Iterator<T> iterator = values.iterator();
        T best = iterator.next();
        while (iterator.hasNext()) {
            T candidate = iterator.next();
            if (candidate.compareTo(best) > 0) {
                best = candidate;
            }
        }
        return best;
    }
}
