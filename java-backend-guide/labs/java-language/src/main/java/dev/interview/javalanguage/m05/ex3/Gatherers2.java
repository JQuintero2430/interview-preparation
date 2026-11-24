package dev.interview.javalanguage.m05.ex3;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Gatherer;
import java.util.stream.Gatherer.Downstream;
import java.util.stream.Gatherer.Integrator;

/**
 * Module 05 Ex05.3: two gatherers the JDK does not ship. Both are sequential, because each depends on encounter
 * order, and both keep their state in an object their initializer creates, so one instance can serve any number of
 * pipelines at once.
 */
public final class Gatherers2 {

    private Gatherers2() {}

    /**
     * Drops an element when it equals the one just before it ({@code Objects.equals}, so {@code null} equals
     * {@code null}): {@code a, a, b, a} becomes {@code a, b, a}.
     */
    public static <T> Gatherer<T, ?, T> distinctConsecutive() {
        return Gatherer.<T, Previous<T>, T>ofSequential(
                Previous::new, // initializer: no previous element yet
                Integrator.ofGreedy(Previous::integrate)); // never stops on its own; relays push's answer
    }

    /**
     * Groups elements into unmodifiable lists of {@code size}, the last one possibly shorter; no batch for an empty
     * stream. Same contract as {@code Gatherers.windowFixed(size)}.
     *
     * @throws IllegalArgumentException if {@code size} is less than 1
     */
    public static <T> Gatherer<T, ?, List<T>> batch(int size) {
        if (size < 1) {
            throw new IllegalArgumentException("size must be at least 1, was " + size);
        }
        return Gatherer.<T, Batch<T>, List<T>>ofSequential(
                () -> new Batch<>(size), // initializer: an empty buffer for this run
                Integrator.ofGreedy(Batch::integrate), // pushes a full batch, otherwise keeps buffering
                Batch::finish); // finisher: flushes the short last batch
    }

    // The state of one distinctConsecutive run. "No previous element" needs its own flag, because null is a value.
    private static final class Previous<T> {
        private boolean seen;
        private T last;

        boolean integrate(T element, Downstream<? super T> downstream) {
            if (seen && Objects.equals(last, element)) {
                return true; // a repeat: drop it and ask for more
            }
            seen = true;
            last = element;
            return downstream.push(element);
        }
    }

    // The state of one batch run: the elements of the batch being filled.
    private static final class Batch<T> {
        private final int size;
        private List<T> buffer;

        Batch(int size) {
            this.size = size;
            this.buffer = new ArrayList<>(size);
        }

        boolean integrate(T element, Downstream<? super List<T>> downstream) {
            buffer.add(element);
            if (buffer.size() < size) {
                return true;
            }
            return downstream.push(takeBuffer());
        }

        void finish(Downstream<? super List<T>> downstream) {
            if (!buffer.isEmpty() && !downstream.isRejecting()) {
                downstream.push(takeBuffer());
            }
        }

        // Hands the filled list downstream as read-only and starts a new one, so a pushed batch never changes later.
        private List<T> takeBuffer() {
            List<T> full = Collections.unmodifiableList(buffer);
            buffer = new ArrayList<>(size);
            return full;
        }
    }
}
