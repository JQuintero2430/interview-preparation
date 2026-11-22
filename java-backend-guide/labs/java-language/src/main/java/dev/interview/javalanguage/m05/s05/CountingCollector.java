package dev.interview.javalanguage.m05.s05;

import java.util.stream.Collector;

// Decorator: the same collector, with every call to its four functions counted.
public final class CountingCollector {

    private CountingCollector() {}

    public static <T, A, R> Collector<T, A, R> counting(Collector<T, A, R> collector, CallCounts counts) {
        var supplier = collector.supplier();
        var accumulator = collector.accumulator();
        var combiner = collector.combiner();
        var finisher = collector.finisher();
        return Collector.of(
                () -> {
                    counts.supplierCalled();
                    return supplier.get();
                },
                (container, element) -> {
                    counts.accumulatorCalled();
                    accumulator.accept(container, element);
                },
                (left, right) -> {
                    counts.combinerCalled();
                    return combiner.apply(left, right);
                },
                container -> {
                    counts.finisherCalled();
                    return finisher.apply(container);
                },
                collector.characteristics().toArray(Collector.Characteristics[]::new));
    }
}
