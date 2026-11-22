package dev.interview.javalanguage.m05.s06;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;
import java.util.stream.Stream;

// reduce combines values; collect fills containers. Each method shows one rule from the Stream Javadoc.
public final class Reductions {

    private Reductions() {}

    // Correct only when seed is 0: the seed is used once per chunk, not once per stream.
    public static int sumFrom(int seed, IntStream numbers) {
        return numbers.reduce(seed, Integer::sum);
    }

    // Anti-pattern: the identity is one mutable list shared by every chunk.
    public static <T> List<T> listByReduce(Stream<T> elements, List<T> identity) {
        return elements.reduce(
                identity,
                (list, element) -> {
                    list.add(element);
                    return list;
                },
                (left, right) -> {
                    left.addAll(right);
                    return left;
                });
    }

    // Mutable reduction: a fresh ArrayList per chunk, merged in encounter order.
    public static <T> List<T> listByCollect(Stream<T> elements) {
        return elements.collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    // Three-argument reduce: the accumulator maps and adds, the combiner adds two partial sums.
    public static int totalLength(Stream<String> words) {
        return words.reduce(0, (sum, word) -> sum + word.length(), Integer::sum);
    }
}
