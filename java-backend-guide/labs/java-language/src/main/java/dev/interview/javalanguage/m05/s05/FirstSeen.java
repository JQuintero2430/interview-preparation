package dev.interview.javalanguage.m05.s05;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collector;

// Collects elements into an unmodifiable Set that keeps the order in which each element was first seen.
public final class FirstSeen {

    private FirstSeen() {}

    public static <T> Collector<T, ?, Set<T>> toSet() {
        return Collector.of(
                LinkedHashSet<T>::new, // supplier: one empty container per chunk of input
                Set::add, // accumulator: adds one element to a container
                FirstSeen::appendRight, // combiner: merges two chunks, left chunk first
                Collections::unmodifiableSet); // finisher: runs once, on the final container
    }

    // Elements already in left keep their place; the rest of right goes after them.
    private static <T> LinkedHashSet<T> appendRight(LinkedHashSet<T> left, LinkedHashSet<T> right) {
        left.addAll(right);
        return left;
    }
}
