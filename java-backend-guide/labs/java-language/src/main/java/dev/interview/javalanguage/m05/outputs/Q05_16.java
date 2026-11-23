package dev.interview.javalanguage.m05.outputs;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collector;

// Module 05 Q05.16: characteristics are promises; a false IDENTITY_FINISH makes the JDK skip the finisher.
public final class Q05_16 {

    private Q05_16() {}

    // Honest: the finisher wraps the list, so the collector does not claim IDENTITY_FINISH.
    public static <T> Collector<T, ?, List<T>> toReadOnlyList() {
        return Collector.of(ArrayList<T>::new, List::add, Q05_16::appendRight, Collections::unmodifiableList);
    }

    // Wrong: claims IDENTITY_FINISH although the finisher does work, so collect() never calls it.
    public static <T> Collector<T, ?, List<T>> toReadOnlyListFalselyIdentity() {
        return Collector.of(
                ArrayList<T>::new,
                List::add,
                Q05_16::appendRight,
                Collections::unmodifiableList,
                Collector.Characteristics.IDENTITY_FINISH);
    }

    private static <T> ArrayList<T> appendRight(ArrayList<T> left, ArrayList<T> right) {
        left.addAll(right);
        return left;
    }
}
