package dev.interview.javalanguage.m05.s02;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;

// Three ways to count words at least minLength long. Only the last one keeps the lambdas free of shared state.
public final class WordTally {

    private WordTally() {}

    // Anti-pattern: a one-element array smuggles a mutable counter past the effectively final rule.
    public static int countWithArrayHolder(Stream<String> words, int minLength) {
        int[] count = {0};
        words.forEach(word -> {
            if (word.length() >= minLength) {
                count[0]++;
            }
        });
        return count[0];
    }

    // Thread-safe, but still a side effect: every matching element updates one shared counter.
    public static int countWithAtomic(Stream<String> words, int minLength) {
        AtomicInteger count = new AtomicInteger();
        words.forEach(word -> {
            if (word.length() >= minLength) {
                count.incrementAndGet();
            }
        });
        return count.get();
    }

    // The stream owns the counting; the lambda only answers a question about one element.
    public static long countWithStream(Stream<String> words, int minLength) {
        return words.filter(word -> word.length() >= minLength).count();
    }
}
