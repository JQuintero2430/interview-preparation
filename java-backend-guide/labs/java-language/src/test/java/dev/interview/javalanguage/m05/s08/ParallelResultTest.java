package dev.interview.javalanguage.m05.s08;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.stream.IntStream;
import java.util.stream.LongStream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;

class ParallelResultTest {

    @RepeatedTest(5)
    @DisplayName("M05 §8 · a parallel sum equals the sequential sum")
    void parallelSum_equalsSequentialSum() {
        long sequential = LongStream.rangeClosed(1, 1_000_000).sum();
        long parallel = LongStream.rangeClosed(1, 1_000_000).parallel().sum();

        assertThat(parallel).isEqualTo(sequential).isEqualTo(500_000_500_000L);
        // pi(100,000) = 9,592: the same count whichever threads tested which numbers.
        assertThat(Primes.countInParallel(100_000))
                .isEqualTo(Primes.count(100_000))
                .isEqualTo(9_592L);
    }

    @Test
    @DisplayName("M05 §8 · a parallel pipeline still returns its result in encounter order")
    void parallelMap_keepsEncounterOrderInResult() {
        // The example from the java.util.stream package summary.
        int[] doubled = IntStream.range(0, 5).parallel().map(x -> x * 2).toArray();

        assertThat(doubled).containsExactly(0, 2, 4, 6, 8);
    }

    @RepeatedTest(5)
    @DisplayName("M05 §8 · forEach in parallel may lose encounter order and forEachOrdered keeps it")
    void forEachOrdered_keepsEncounterOrder() {
        List<Integer> source = IntStream.range(0, 2_000).boxed().toList();
        Queue<Integer> anyOrder = new ConcurrentLinkedQueue<>();
        List<Integer> encounterOrder = Collections.synchronizedList(new ArrayList<>());

        source.parallelStream().forEach(anyOrder::add);
        source.parallelStream().forEachOrdered(encounterOrder::add);

        assertThat(encounterOrder).containsExactlyElementsOf(source);
        // forEach promises every element once, not their order: assert the multiset only.
        assertThat(anyOrder).containsExactlyInAnyOrderElementsOf(source);
    }

    @RepeatedTest(5)
    @DisplayName("M05 §8 · findFirst returns the first match in parallel and findAny returns some match")
    void findFirstAndFindAny_onParallelStream() {
        List<Integer> source = IntStream.rangeClosed(1, 10_000).boxed().toList();

        var first = source.parallelStream().filter(n -> n % 7 == 0).findFirst();
        var any = source.parallelStream().filter(n -> n % 7 == 0).findAny();

        assertThat(first).contains(7);
        // Permitted set: any multiple of 7 in the source.
        assertThat(any).hasValueSatisfying(n -> assertThat(n % 7).isZero());
    }
}
