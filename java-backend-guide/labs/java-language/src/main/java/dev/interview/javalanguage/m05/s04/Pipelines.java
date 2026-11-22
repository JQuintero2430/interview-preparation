package dev.interview.javalanguage.m05.s04;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

// Pipelines that log each stage's calls into events, to show when and in what order lambdas run.
public final class Pipelines {

    private Pipelines() {}

    // Builds filter and map stages but never runs them: there is no terminal operation.
    public static Stream<String> withoutTerminal(List<String> words, List<String> events) {
        return words.stream()
                .filter(w -> logged(events, "filter " + w, w.length() > 3))
                .map(w -> logged(events, "map " + w, w.toUpperCase()));
    }

    // The same stages ended by findFirst: each word goes through filter and map before the next word starts.
    public static Optional<String> firstLongWord(List<String> words, List<String> events) {
        return withoutTerminal(words, events).findFirst();
    }

    // An infinite source made finite by a short-circuiting terminal operation.
    public static Optional<Integer> firstMultipleOf(int divisor, List<String> events) {
        return Stream.iterate(1, n -> n + 1)
                .peek(n -> events.add("visit " + n))
                .filter(n -> n % divisor == 0)
                .findFirst();
    }

    // An infinite source made finite by a short-circuiting intermediate operation.
    public static List<Integer> firstN(int n, List<String> events) {
        return Stream.iterate(1, i -> i + 1)
                .peek(i -> events.add("visit " + i))
                .limit(n)
                .toList();
    }

    // takeWhile stops at the first element that fails the predicate; filter would never stop.
    public static List<Integer> whileBelow(int bound, List<String> events) {
        return Stream.iterate(1, i -> i + 1)
                .peek(i -> events.add("visit " + i))
                .takeWhile(i -> i < bound)
                .toList();
    }

    // sorted is a barrier: it buffers every element before it passes any of them downstream.
    public static Optional<String> firstSorted(List<String> words, List<String> events) {
        return words.stream()
                .peek(w -> events.add("before " + w))
                .sorted()
                .peek(w -> events.add("after " + w))
                .findFirst();
    }

    // distinct is stateful (it remembers what it has seen) but, sequentially, not a barrier.
    public static List<String> distinctTraced(List<String> words, List<String> events) {
        return words.stream()
                .peek(w -> events.add("before " + w))
                .distinct()
                .peek(w -> events.add("after " + w))
                .toList();
    }

    private static <T> T logged(List<String> events, String event, T result) {
        events.add(event);
        return result;
    }
}
