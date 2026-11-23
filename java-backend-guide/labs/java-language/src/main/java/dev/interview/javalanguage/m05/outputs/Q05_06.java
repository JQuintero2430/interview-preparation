package dev.interview.javalanguage.m05.outputs;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

// Module 05 Q05.06: a one-element array gets past the effectively final rule and shares one counter.
public final class Q05_06 {

    private Q05_06() {}

    // Bug: every supplier reads the same array slot, so all of them see its last value.
    public static List<Supplier<Integer>> pageLoadersBuggy(int pages) {
        List<Supplier<Integer>> loaders = new ArrayList<>();
        int[] page = {0};
        for (; page[0] < pages; page[0]++) {
            loaders.add(() -> page[0]);
        }
        return loaders;
    }

    // Fix: a fresh effectively final local per iteration, captured by value.
    public static List<Supplier<Integer>> pageLoadersFixed(int pages) {
        List<Supplier<Integer>> loaders = new ArrayList<>();
        for (int i = 0; i < pages; i++) {
            int page = i;
            loaders.add(() -> page);
        }
        return loaders;
    }

    // Still the bug: an AtomicInteger is one shared counter too, so atomicity does not help here.
    public static List<Supplier<Integer>> pageLoadersAtomic(int pages) {
        List<Supplier<Integer>> loaders = new ArrayList<>();
        AtomicInteger page = new AtomicInteger();
        for (; page.get() < pages; page.incrementAndGet()) {
            loaders.add(() -> page.get());
        }
        return loaders;
    }

    public static List<Integer> run(List<Supplier<Integer>> loaders) {
        return loaders.stream().map(Supplier::get).toList();
    }
}
