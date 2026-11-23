package dev.interview.javalanguage.m05.ex2;

import java.util.OptionalLong;
import java.util.stream.Collector;

/**
 * Module 05 Ex05.2: count, sum, minimum and maximum of {@code long} values. An empty input is its own type, so no
 * sentinel such as {@code Long.MAX_VALUE} ever reaches a caller as a minimum.
 */
public sealed interface Stats permits Stats.Empty, Stats.NonEmpty {

    long count();

    long sum();

    OptionalLong min();

    OptionalLong max();

    /** A collector that is correct sequentially and in parallel: one container per chunk, merged by the combiner. */
    static Collector<Long, ?, Stats> collector() {
        return Collector.of(
                StatsAccumulator::new, // supplier: a fresh container for each chunk
                StatsAccumulator::add, // accumulator: folds one value in
                StatsAccumulator::merge, // combiner: folds the right chunk into the left one
                StatsAccumulator::toStats); // finisher: builds the immutable result, so no IDENTITY_FINISH
    }

    record Empty() implements Stats {

        @Override
        public long count() {
            return 0;
        }

        @Override
        public long sum() {
            return 0;
        }

        @Override
        public OptionalLong min() {
            return OptionalLong.empty();
        }

        @Override
        public OptionalLong max() {
            return OptionalLong.empty();
        }
    }

    record NonEmpty(long count, long sum, long minimum, long maximum) implements Stats {

        @Override
        public OptionalLong min() {
            return OptionalLong.of(minimum);
        }

        @Override
        public OptionalLong max() {
            return OptionalLong.of(maximum);
        }
    }
}
