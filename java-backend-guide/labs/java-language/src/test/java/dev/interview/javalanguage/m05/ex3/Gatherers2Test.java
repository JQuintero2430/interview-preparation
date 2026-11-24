package dev.interview.javalanguage.m05.ex3;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Gatherers;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class Gatherers2Test {

    @Test
    @DisplayName("Ex05.3 · (1) distinctConsecutive turns a, a, b, a, c, c into a, b, a, c")
    void distinctConsecutive_dropsOnlyRepeatsOfThePreviousElement() {
        var result = Stream.of("a", "a", "b", "a", "c", "c")
                .gather(Gatherers2.<String>distinctConsecutive())
                .toList();

        // Unlike distinct(), the second "a" survives: it repeats an earlier element, not the previous one.
        assertThat(result).containsExactly("a", "b", "a", "c");
    }

    @Test
    @DisplayName("Ex05.3 · (1) distinctConsecutive on an empty stream emits nothing")
    void distinctConsecutive_emptyStream() {
        assertThat(Stream.<String>empty()
                        .gather(Gatherers2.distinctConsecutive())
                        .toList())
                .isEmpty();
    }

    @ParameterizedTest(name = "batch size {0}")
    @ValueSource(ints = {1, 2, 3, 7, 10, 11})
    @DisplayName("Ex05.3 · (2) batch(n) emits batches of n and a short last batch, equal to windowFixed(n)")
    void batch_matchesWindowFixed(int size) {
        var batches = IntStream.rangeClosed(1, 10)
                .boxed()
                .gather(Gatherers2.<Integer>batch(size))
                .toList();
        var windows = IntStream.rangeClosed(1, 10)
                .boxed()
                .gather(Gatherers.<Integer>windowFixed(size))
                .toList();

        assertThat(batches).isEqualTo(windows);
        assertThat(batches.subList(0, batches.size() - 1))
                .allSatisfy(b -> assertThat(b).hasSize(size));
        assertThat(batches.getLast()).hasSize(10 - size * (batches.size() - 1));
    }

    @Test
    @DisplayName("Ex05.3 · (2) batch(3) over 1..8 gives [1, 2, 3], [4, 5, 6], [7, 8]; nothing for an empty stream")
    void batch_shortLastBatchAndEmptyStream() {
        assertThat(Stream.of(1, 2, 3, 4, 5, 6, 7, 8)
                        .gather(Gatherers2.<Integer>batch(3))
                        .toList())
                .containsExactly(List.of(1, 2, 3), List.of(4, 5, 6), List.of(7, 8));
        assertThat(Stream.<Integer>empty().gather(Gatherers2.batch(3)).toList()).isEmpty();
    }

    @Test
    @DisplayName("Ex05.3 · (2) like windowFixed, batch rejects a size below 1 and emits unmodifiable lists")
    void batch_rejectsBadSize_andBatchesAreUnmodifiable() {
        assertThatIllegalArgumentException().isThrownBy(() -> Gatherers2.batch(0));
        assertThatIllegalArgumentException().isThrownBy(() -> Gatherers.windowFixed(0));

        var first = Stream.of(1, 2, 3).gather(Gatherers2.<Integer>batch(2)).toList();
        var full = first.getFirst();
        var shortLast = first.getLast();

        assertThatExceptionOfType(UnsupportedOperationException.class).isThrownBy(() -> full.add(99));
        assertThatExceptionOfType(UnsupportedOperationException.class).isThrownBy(() -> shortLast.add(99));
    }

    @Test
    @DisplayName("Ex05.3 · (3) distinctConsecutive on an infinite stream stops when a later limit is reached")
    void distinctConsecutive_infiniteStreamWithLimit() {
        List<Integer> pulled = new ArrayList<>();

        var result = Stream.iterate(0, i -> i + 1)
                .map(i -> i / 3) // 0, 0, 0, 1, 1, 1, 2, 2, 2, ...
                .peek(pulled::add)
                .gather(Gatherers2.<Integer>distinctConsecutive())
                .limit(5)
                .toList();

        assertThat(result).containsExactly(0, 1, 2, 3, 4);
        // The fifth distinct value (4) is the 13th element pulled; nothing after it is pulled.
        assertThat(pulled).hasSize(13).endsWith(3, 3, 4);
    }

    @Test
    @DisplayName("Ex05.3 · (3) batch on an infinite stream stops when a later limit is reached")
    void batch_infiniteStreamWithLimit() {
        List<Integer> pulled = new ArrayList<>();

        var result = Stream.iterate(1, i -> i + 1)
                .peek(pulled::add)
                .gather(Gatherers2.<Integer>batch(4))
                .limit(3)
                .toList();

        assertThat(result).containsExactly(List.of(1, 2, 3, 4), List.of(5, 6, 7, 8), List.of(9, 10, 11, 12));
        assertThat(pulled).hasSize(12);
    }

    @Test
    @DisplayName("Ex05.3 · (4) distinctConsecutive treats null as equal to null and different from any value")
    void distinctConsecutive_nullsAreEqualToEachOther() {
        var result = Stream.of(null, null, "a", null, null, "a", "a")
                .gather(Gatherers2.<String>distinctConsecutive())
                .toList();

        assertThat(result).containsExactly(null, "a", null, "a");
    }

    @Test
    @DisplayName(
            "Ex05.3 · (4) a leading null is emitted: \"no previous element\" is not the same as \"previous was null\"")
    void distinctConsecutive_leadingNullIsKept() {
        assertThat(Stream.of((String) null)
                        .gather(Gatherers2.<String>distinctConsecutive())
                        .toList())
                .containsExactly((String) null);
    }

    @Test
    @DisplayName("Ex05.3 · (5) one gatherer instance used by two pipelines in turn: each run starts with fresh state")
    void oneInstance_twoPipelinesInTurn() {
        var distinct = Gatherers2.<String>distinctConsecutive();
        var batch = Gatherers2.<Integer>batch(2);

        assertThat(Stream.of("x", "y").gather(distinct).toList()).containsExactly("x", "y");
        // A state kept in a field or a captured variable would remember "y" and drop this first element.
        assertThat(Stream.of("y", "y", "z").gather(distinct).toList()).containsExactly("y", "z");

        assertThat(Stream.of(1, 2, 3).gather(batch).toList()).containsExactly(List.of(1, 2), List.of(3));
        // A shared buffer would still hold 3 here, or would have been cleared under the first run's feet.
        assertThat(Stream.of(4, 5).gather(batch).toList()).containsExactly(List.of(4, 5));
    }

    @Test
    @DisplayName("Ex05.3 · (5) one gatherer instance used by two interleaved pipelines: neither sees the other's state")
    void oneInstance_twoInterleavedPipelines() {
        var distinct = Gatherers2.<String>distinctConsecutive();
        Iterator<String> left = Stream.of("a", "a", "b", "b").gather(distinct).iterator();
        Iterator<String> right = Stream.of("b", "b", "a", "a").gather(distinct).iterator();

        // Alternate pulls, so both pipelines are mid-run at the same time.
        List<String> fromLeft = new ArrayList<>();
        List<String> fromRight = new ArrayList<>();
        while (left.hasNext() || right.hasNext()) {
            if (left.hasNext()) {
                fromLeft.add(left.next());
            }
            if (right.hasNext()) {
                fromRight.add(right.next());
            }
        }

        assertThat(fromLeft).containsExactly("a", "b");
        assertThat(fromRight).containsExactly("b", "a");
    }
}
