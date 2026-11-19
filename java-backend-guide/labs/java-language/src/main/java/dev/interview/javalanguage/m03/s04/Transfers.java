package dev.interview.javalanguage.m03.s04;

import java.util.List;

// Module 03 §4: one signature per wildcard role: a producer, a consumer, both at once, and an unbounded list.
public final class Transfers {

    private static final Integer ONE = 1;
    private static final int PAIR = 2;

    private Transfers() {}

    public static double total(List<? extends Number> numbers) {
        double total = 0.0;
        for (Number number : numbers) {
            total += number.doubleValue();
        }
        return total;
    }

    public static void fillWithOnes(List<? super Integer> sink, int count) {
        for (int added = 0; added < count; added++) {
            sink.add(ONE);
        }
    }

    public static <T> void appendAll(List<? super T> destination, List<? extends T> source) {
        for (T element : source) {
            destination.add(element);
        }
    }

    public static void swapFirstTwo(List<?> list) {
        if (list.size() < PAIR) {
            return;
        }
        swapFirstTwoCaptured(list);
    }

    // The helper gives the unknown element type a name, E, so a value read from the list can be written back.
    private static <E> void swapFirstTwoCaptured(List<E> list) {
        E first = list.get(0);
        list.set(0, list.get(1));
        list.set(1, first);
    }
}
