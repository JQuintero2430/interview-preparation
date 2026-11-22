package dev.interview.javalanguage.m05.s05;

import java.util.concurrent.atomic.AtomicInteger;

// How many times each function of a collector was called; safe to update from several threads.
public final class CallCounts {

    private final AtomicInteger supplier = new AtomicInteger();
    private final AtomicInteger accumulator = new AtomicInteger();
    private final AtomicInteger combiner = new AtomicInteger();
    private final AtomicInteger finisher = new AtomicInteger();

    void supplierCalled() {
        supplier.incrementAndGet();
    }

    void accumulatorCalled() {
        accumulator.incrementAndGet();
    }

    void combinerCalled() {
        combiner.incrementAndGet();
    }

    void finisherCalled() {
        finisher.incrementAndGet();
    }

    public int supplier() {
        return supplier.get();
    }

    public int accumulator() {
        return accumulator.get();
    }

    public int combiner() {
        return combiner.get();
    }

    public int finisher() {
        return finisher.get();
    }
}
