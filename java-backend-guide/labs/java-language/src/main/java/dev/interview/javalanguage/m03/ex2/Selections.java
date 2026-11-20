package dev.interview.javalanguage.m03.ex2;

import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.function.Predicate;

// Module 03 Ex03.2: each parameter says whether it produces T or consumes T, so callers with related types fit.
public final class Selections {

    static final String EMPTY = "max of an empty collection";

    private Selections() {}

    // Comparable<? super T> admits LocalDate (a Comparable<ChronoLocalDate>); ? extends T lets T be wider than the
    // element type.
    public static <T extends Comparable<? super T>> T max(Collection<? extends T> values) {
        Iterator<? extends T> iterator = values.iterator();
        if (!iterator.hasNext()) {
            throw new NoSuchElementException(EMPTY);
        }
        T best = iterator.next();
        while (iterator.hasNext()) {
            best = larger(best, iterator.next());
        }
        return best;
    }

    // src produces T, keep consumes T, dst consumes T: producer extends, consumer super.
    public static <T> void copyMatching(List<? extends T> src, Predicate<? super T> keep, Collection<? super T> dst) {
        for (T element : src) {
            if (keep.test(element)) {
                dst.add(element);
            }
        }
    }

    private static <T extends Comparable<? super T>> T larger(T best, T candidate) {
        return candidate.compareTo(best) > 0 ? candidate : best;
    }
}
