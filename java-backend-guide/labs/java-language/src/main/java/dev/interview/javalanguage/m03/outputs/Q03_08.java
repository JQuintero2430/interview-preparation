package dev.interview.javalanguage.m03.outputs;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

// Module 03 Q03.08: Comparable<? super T> admits types that inherit their Comparable, such as LocalDate.
public final class Q03_08 {

    private Q03_08() {}

    public static void main(String[] args) {
        System.out.println(latest(List.of(LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 9))));
        System.out.println(latest(List.of(3, 7, 5)));
    }

    public static <T extends Comparable<? super T>> T latest(List<T> values) {
        return Collections.max(values);
    }
}
