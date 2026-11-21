package dev.interview.javalanguage.m04.outputs;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Stream;

// Module 04 Q04.27: four lists typed List<String>, four answers to set, add and contains(null).
public final class Q04_27 {

    private Q04_27() {}

    public static void main(String[] args) {
        String[] array = {"a", "b"};
        System.out.println(probe("List.of", List.of("a", "b")));
        System.out.println(probe("unmodifiableList", Collections.unmodifiableList(new ArrayList<>(List.of("a", "b")))));
        System.out.println(probe("Arrays.asList", Arrays.asList(array)));
        System.out.println(Arrays.toString(array));
        System.out.println(probe("Stream.toList", Stream.of("a", "b").toList()));
    }

    // Calls set, add and contains(null) in that order and reports each result or exception.
    static String probe(String name, List<String> list) {
        return name + ": set " + outcome(() -> list.set(0, "z"))
                + ", add " + outcome(() -> list.add("z"))
                + ", contains(null) " + outcome(() -> list.contains(null));
    }

    static String outcome(Supplier<Object> call) {
        try {
            return String.valueOf(call.get());
        } catch (RuntimeException e) {
            return e.getClass().getSimpleName();
        }
    }
}
