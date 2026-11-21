package dev.interview.javalanguage.m04.outputs;

import java.util.List;
import java.util.function.Function;

// Module 04 Q04.32: an indexed loop is linear on an ArrayList and quadratic on a LinkedList.
public final class Q04_32 {

    private Q04_32() {}

    // The incident: get(i) is constant time on an ArrayList and a walk from the nearer end on a LinkedList.
    public static String exportIndexed(List<String> rows, Function<String, String> format) {
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < rows.size(); i++) {
            out.append(format.apply(rows.get(i))).append('\n');
        }
        return out.toString();
    }

    // The fix: one iterator walk, linear for every List implementation.
    public static String exportIterated(List<String> rows, Function<String, String> format) {
        StringBuilder out = new StringBuilder();
        for (String row : rows) {
            out.append(format.apply(row)).append('\n');
        }
        return out.toString();
    }

    // Link steps LinkedList.node(int) takes for get(0) .. get(n - 1): min(i, n - 1 - i) each.
    public static long linkedListSteps(int n) {
        long steps = 0;
        for (int i = 0; i < n; i++) {
            steps += Math.min(i, n - 1 - i);
        }
        return steps;
    }
}
