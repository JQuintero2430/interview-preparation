package dev.interview.javalanguage.m05.s06;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Parallel tests assert permitted outcomes only (M05 §1 lab rules): never a split count or a thread.
class ReduceVsCollectTest {

    private static final int N = 1_000;
    private static final List<Integer> NUMBERS =
            IntStream.rangeClosed(1, N).boxed().toList();

    @Test
    @DisplayName("M05 §6 · reduce with a non-identity seed differs between sequential and parallel")
    void reduce_withNonIdentitySeed_addsSeedOncePerChunk() {
        int sum = 100 * 101 / 2;

        int sequential = Reductions.sumFrom(10, IntStream.rangeClosed(1, 100));
        int parallel = Reductions.sumFrom(10, IntStream.rangeClosed(1, 100).parallel());

        assertThat(sequential).isEqualTo(sum + 10);
        // One seed per leaf chunk: k is between 2 (the stream split at least once) and 100 (one element per chunk).
        assertThat((parallel - sum) % 10).isZero();
        assertThat((parallel - sum) / 10).isBetween(2, 100);
    }

    @Test
    @DisplayName("M05 §6 · reduce with the true identity gives the same sum sequentially and in parallel")
    void reduce_withIdentity_isStableInParallel() {
        int sum = 100 * 101 / 2;

        assertThat(Reductions.sumFrom(0, IntStream.rangeClosed(1, 100).parallel()))
                .isEqualTo(sum);
    }

    @Test
    @DisplayName("M05 §6 · reduce into a shared mutable list works sequentially and duplicates elements in parallel")
    void reduce_intoSharedList_breaksInParallel() {
        List<Integer> sequentialIdentity = Collections.synchronizedList(new ArrayList<>());
        List<Integer> parallelIdentity = Collections.synchronizedList(new ArrayList<>());

        var sequential = Reductions.listByReduce(NUMBERS.stream(), sequentialIdentity);
        var parallel = Reductions.listByReduce(NUMBERS.parallelStream(), parallelIdentity);

        assertThat(sequential).isSameAs(sequentialIdentity).isEqualTo(NUMBERS);
        // Every chunk adds to the one identity list, and the last combine appends that list to itself.
        assertThat(parallel).isSameAs(parallelIdentity);
        assertThat(parallel).hasSizeGreaterThanOrEqualTo(2 * N);
        assertThat(parallel).containsAll(NUMBERS);
    }

    @Test
    @DisplayName("M05 §6 · collect into a list is correct in parallel")
    void collect_intoList_isCorrectInParallel() {
        assertThat(Reductions.listByCollect(NUMBERS.parallelStream())).isEqualTo(NUMBERS);
        assertThat(NUMBERS.parallelStream().collect(Collectors.toList())).isEqualTo(NUMBERS);
    }

    @Test
    @DisplayName("M05 §6 · three-argument reduce maps and sums with a combiner")
    void reduce_threeArgument_foldsAMappingStep() {
        var words = Stream.of("map", "flatMap", "mapMulti", "reduce");

        assertThat(Reductions.totalLength(words.parallel())).isEqualTo(3 + 7 + 8 + 6);
    }

    @Test
    @DisplayName("M05 §6 · reduce with String::concat equals joining, at the cost of copying")
    void reduce_concat_equalsJoining() {
        var words = List.of("re", "du", "ce");

        assertThat(words.stream().reduce("", String::concat))
                .isEqualTo(words.stream().collect(Collectors.joining()))
                .isEqualTo("reduce");
    }
}
