package dev.interview.javalanguage.m05.s04;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class StatefulOperationsTest {

    @Test
    @DisplayName("M05 §4 · sorted buffers every element before the next stage runs")
    void sorted_buffersEveryElement_beforeTheNextStageRuns() {
        List<String> events = new ArrayList<>();

        var first = Pipelines.firstSorted(List.of("pear", "apple", "fig"), events);

        assertThat(first).contains("apple");
        assertThat(events).containsExactly("before pear", "before apple", "before fig", "after apple");
    }

    @Test
    @DisplayName("M05 §4 · limit after sorted does not bound the elements sorted reads")
    void limitAfterSorted_readsEveryElement_limitBeforeSortedReadsN() {
        var limitAfter = new AtomicInteger();
        var limitBefore = new AtomicInteger();

        var after = descending(1_000)
                .peek(n -> limitAfter.incrementAndGet())
                .sorted()
                .limit(3)
                .toList();
        var before = descending(1_000)
                .peek(n -> limitBefore.incrementAndGet())
                .limit(3)
                .sorted()
                .toList();

        assertThat(after).containsExactly(1, 2, 3);
        assertThat(before).containsExactly(998, 999, 1_000);
        assertThat(limitAfter).hasValue(1_000);
        assertThat(limitBefore).hasValue(3);
    }

    @Test
    @DisplayName("M05 §4 · sorted() on a source already known to be sorted is skipped")
    void naturalSorted_onSortedSource_isNotABarrier() {
        var seen = new AtomicInteger();

        var firstThree = IntStream.rangeClosed(1, 1_000)
                .boxed()
                .peek(n -> seen.incrementAndGet())
                .sorted()
                .limit(3)
                .toList();

        assertThat(firstThree).containsExactly(1, 2, 3);
        assertThat(seen).hasValue(3);
    }

    @Test
    @DisplayName("M05 §4 · a sequential distinct passes each new element on as soon as it sees it")
    void sequentialDistinct_passesNewElementsOnImmediately() {
        List<String> events = new ArrayList<>();

        var unique = Pipelines.distinctTraced(List.of("a", "b", "a", "c"), events);

        assertThat(unique).containsExactly("a", "b", "c");
        assertThat(events)
                .containsExactly("before a", "after a", "before b", "after b", "before a", "before c", "after c");
    }

    // 1000, 999, …, 1: the map hides the range's SORTED flag, so sorted() must really sort.
    private static Stream<Integer> descending(int n) {
        return IntStream.rangeClosed(1, n).map(i -> n + 1 - i).boxed();
    }
}
