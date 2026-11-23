package dev.interview.javalanguage.m05.outputs;

import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Stream;

// Module 05 Q05.12: a stream is single-use; hold the source, the collected result or a Supplier instead.
public final class Q05_12 {

    private Q05_12() {}

    // Bug: count() consumes the stream, so findFirst() on the same object throws IllegalStateException.
    public static String errorSummaryBuggy(List<String> lines) {
        Stream<String> errors = lines.stream().filter(line -> line.startsWith("ERROR"));
        long count = errors.count();
        String first = errors.findFirst().orElse("none");
        return count + " errors, first: " + first;
    }

    // Fix: collect once and ask the list both questions.
    public static String errorSummary(List<String> lines) {
        List<String> errors =
                lines.stream().filter(line -> line.startsWith("ERROR")).toList();
        String first = errors.isEmpty() ? "none" : errors.getFirst();
        return errors.size() + " errors, first: " + first;
    }

    // Alternative: a Supplier builds a fresh pipeline for each traversal (the source is read twice).
    public static String errorSummaryFromSupplier(Supplier<Stream<String>> errors) {
        long count = errors.get().count();
        String first = errors.get().findFirst().orElse("none");
        return count + " errors, first: " + first;
    }
}
