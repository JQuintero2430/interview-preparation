package dev.interview.javalanguage.m05.outputs;

import java.util.List;
import java.util.Set;
import java.util.Spliterator;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;
import java.util.stream.StreamSupport;

// Module 05 Q05.23: a parallel stream can only fork work if its spliterator splits.
public final class Q05_23 {

    private Q05_23() {}

    // Records the threads that ran the lambda of a parallel stream over the given spliterator.
    public static <T> Set<Thread> threadsUsed(Spliterator<T> source) {
        Set<Thread> threads = ConcurrentHashMap.newKeySet();
        StreamSupport.stream(source, true).forEach(element -> threads.add(Thread.currentThread()));
        return threads;
    }

    // Wraps a list's spliterator but refuses every split: trySplit() returns null.
    public static <T> Spliterator<T> nonSplitting(List<T> list) {
        return new NonSplitting<>(list.spliterator());
    }

    private record NonSplitting<T>(Spliterator<T> delegate) implements Spliterator<T> {

        @Override
        public boolean tryAdvance(Consumer<? super T> action) {
            return delegate.tryAdvance(action);
        }

        @Override
        public Spliterator<T> trySplit() {
            return null; // "cannot be split": the whole traversal stays one task
        }

        @Override
        public long estimateSize() {
            return delegate.estimateSize();
        }

        @Override
        public int characteristics() {
            return delegate.characteristics();
        }
    }
}
