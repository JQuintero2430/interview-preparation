package dev.interview.javalanguage.m05.outputs;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

// Module 05 Q05.17: reduce folds immutable values; it can build a list only by copying at every step.
public final class Q05_17 {

    private Q05_17() {}

    // Immutable reduction: every step returns a new list, so sharing the identity is safe, but copying is O(n²).
    public static <T> List<T> listByImmutableReduce(Stream<T> elements) {
        return elements.reduce(List.of(), Q05_17::append, Q05_17::concat);
    }

    // Mutable reduction: one fresh ArrayList per chunk, merged in encounter order.
    public static <T> List<T> listByCollect(Stream<T> elements) {
        return elements.collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    private static <T> List<T> append(List<T> list, T element) {
        List<T> copy = new ArrayList<>(list);
        copy.add(element);
        return List.copyOf(copy);
    }

    private static <T> List<T> concat(List<T> left, List<T> right) {
        List<T> copy = new ArrayList<>(left);
        copy.addAll(right);
        return List.copyOf(copy);
    }
}
