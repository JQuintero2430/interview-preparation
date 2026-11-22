package dev.interview.javalanguage.m05.s07;

import java.util.function.Function;
import java.util.function.ToLongFunction;
import java.util.stream.Gatherer;

// Two custom gatherers: a sequential one with state that short-circuits, and a stateless one that can run in parallel.
public final class Budget {

    private Budget() {}

    // Emits elements while their running cost stays within the budget, then stops pulling from upstream.
    public static <T> Gatherer<T, ?, T> withinBudget(long budget, ToLongFunction<? super T> cost) {
        return Gatherer.ofSequential(
                Spent::new, // initializer: fresh state for every pipeline that uses this gatherer
                (spent, element, downstream) -> { // integrator: called once per element
                    spent.total += cost.applyAsLong(element);
                    if (spent.total > budget) {
                        return false; // no more elements wanted: the stream short-circuits
                    }
                    return downstream.push(element); // false if downstream wants nothing more
                });
    }

    // The Gatherer Javadoc's map example: no state, so Gatherer.of can run it on parallel chunks.
    public static <T, R> Gatherer<T, ?, R> mapping(Function<? super T, ? extends R> mapper) {
        return Gatherer.of((unused, element, downstream) -> downstream.push(mapper.apply(element)));
    }

    // Mutable state, created by the initializer and never shared between pipelines.
    private static final class Spent {
        private long total;
    }
}
