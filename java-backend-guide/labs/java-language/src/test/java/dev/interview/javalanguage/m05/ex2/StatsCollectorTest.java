package dev.interview.javalanguage.m05.ex2;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.List;
import java.util.LongSummaryStatistics;
import java.util.Random;
import java.util.stream.Collector;
import java.util.stream.Collector.Characteristics;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class StatsCollectorTest {

    // Fixed seed: the same 100,000 values on every run.
    private static final long[] RANDOM =
            new Random(42).longs(100_000, -1_000_000, 1_000_000).toArray();

    private static final long[] SMALL = {5, -3, 12, 0, 7, -9, 4, 4, 11, -1};

    @Test
    @DisplayName("Ex05.2 · (1) sequentially, the result matches LongSummaryStatistics on a fixed-seed input")
    void matchesSummaryStatisticsSequentially() {
        Stream<Long> values = Arrays.stream(RANDOM).boxed();

        assertThat(values.isParallel()).isFalse();
        assertThat(values.collect(Stats.collector()))
                .isEqualTo(expected(Arrays.stream(RANDOM).summaryStatistics()));
    }

    @RepeatedTest(10)
    @DisplayName("Ex05.2 · (2) on a parallel stream, the result matches LongSummaryStatistics on every run")
    void matchesSummaryStatisticsInParallel() {
        List<Long> values = Arrays.stream(RANDOM).boxed().toList();
        Stream<Long> parallel = values.parallelStream();

        assertThat(parallel.isParallel()).isTrue();
        assertThat(parallel.collect(Stats.collector()))
                .isEqualTo(expected(Arrays.stream(RANDOM).summaryStatistics()));
    }

    @Test
    @DisplayName("Ex05.2 · (3) an empty stream gives count 0, sum 0 and empty min and max, sequential or parallel")
    void emptyStreamGivesEmptyStats() {
        Stats sequential = Stream.<Long>empty().collect(Stats.collector());
        Stats parallel = List.<Long>of().parallelStream().collect(Stats.collector());

        for (Stats stats : List.of(sequential, parallel)) {
            assertThat(stats.count()).isZero();
            assertThat(stats.sum()).isZero();
            assertThat(stats.min()).isEmpty();
            assertThat(stats.max()).isEmpty();
        }
    }

    @ParameterizedTest(name = "slices [0, {0}), [{0}, {1}), [{1}, 10)")
    @CsvSource({"3, 7", "0, 5", "5, 5", "4, 10", "0, 10", "0, 0"})
    @DisplayName("Ex05.2 · (4) the combiner is associative: (a, b) then c equals a then (b, c), empty slices included")
    void combinerIsAssociative(int firstCut, int secondCut) {
        long[] a = Arrays.copyOfRange(SMALL, 0, firstCut);
        long[] b = Arrays.copyOfRange(SMALL, firstCut, secondCut);
        long[] c = Arrays.copyOfRange(SMALL, secondCut, SMALL.length);
        Collector<Long, ?, Stats> collector = Stats.collector();

        Stats whole = Arrays.stream(SMALL).boxed().collect(collector);

        assertThat(abThenC(collector, a, b, c)).isEqualTo(whole);
        assertThat(aThenBc(collector, a, b, c)).isEqualTo(whole);
    }

    @Test
    @DisplayName(
            "Ex05.2 · (5) characteristics are truthful: not CONCURRENT, not IDENTITY_FINISH, and the finisher builds the record")
    void characteristicsAreTruthful() {
        Collector<Long, ?, Stats> collector = Stats.collector();

        assertThat(collector.characteristics())
                .doesNotContain(Characteristics.CONCURRENT, Characteristics.IDENTITY_FINISH);
        assertThat(finishEmptyContainer(collector)).isInstanceOf(Stats.Empty.class);
    }

    private static Stats expected(LongSummaryStatistics statistics) {
        return new Stats.NonEmpty(statistics.getCount(), statistics.getSum(), statistics.getMin(), statistics.getMax());
    }

    // The helpers capture the hidden container type A, so the collector's own functions can be called directly.
    private static <A> A fill(Collector<Long, A, Stats> collector, long[] values) {
        A container = collector.supplier().get();
        for (long value : values) {
            collector.accumulator().accept(container, value);
        }
        return container;
    }

    private static <A> Stats abThenC(Collector<Long, A, Stats> collector, long[] a, long[] b, long[] c) {
        A ab = collector.combiner().apply(fill(collector, a), fill(collector, b));
        return collector.finisher().apply(collector.combiner().apply(ab, fill(collector, c)));
    }

    private static <A> Stats aThenBc(Collector<Long, A, Stats> collector, long[] a, long[] b, long[] c) {
        A bc = collector.combiner().apply(fill(collector, b), fill(collector, c));
        return collector.finisher().apply(collector.combiner().apply(fill(collector, a), bc));
    }

    private static <A> Stats finishEmptyContainer(Collector<Long, A, Stats> collector) {
        return collector.finisher().apply(collector.supplier().get());
    }
}
