package dev.interview.javalanguage.m05.s07;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.stream.Gatherers;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class BuiltInGatherersTest {

    @Test
    @DisplayName("M05 §7 · windowFixed groups elements and keeps a short last window")
    void windowFixed_keepsShortLastWindow() {
        var windows = Stream.of(1, 2, 3, 4, 5, 6, 7, 8)
                .gather(Gatherers.windowFixed(3))
                .toList();

        assertThat(windows).containsExactly(List.of(1, 2, 3), List.of(4, 5, 6), List.of(7, 8));
        assertThat(Stream.<Integer>empty().gather(Gatherers.windowFixed(3)).toList())
                .isEmpty();
    }

    @Test
    @DisplayName("M05 §7 · windowSliding produces overlapping windows")
    void windowSliding_producesOverlappingWindows() {
        var windows =
                Stream.of(1, 2, 3, 4, 5).gather(Gatherers.windowSliding(3)).toList();
        var shortStream = Stream.of(1, 2).gather(Gatherers.windowSliding(3)).toList();

        assertThat(windows).containsExactly(List.of(1, 2, 3), List.of(2, 3, 4), List.of(3, 4, 5));
        assertThat(shortStream).containsExactly(List.of(1, 2));
    }

    @Test
    @DisplayName("M05 §7 · windows are unmodifiable and the size must be at least 1")
    void windows_areUnmodifiable_andSizeIsValidated() {
        var first =
                Stream.of("a", "b").gather(Gatherers.windowFixed(2)).findFirst().orElseThrow();

        assertThatThrownBy(() -> first.add("c")).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> Gatherers.windowFixed(0)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("M05 §7 · scan emits running totals")
    void scan_emitsRunningTotals() {
        var totals = Stream.of(5, 3, 2, 10)
                .gather(Gatherers.scan(() -> 0, Integer::sum))
                .toList();

        assertThat(totals).containsExactly(5, 8, 10, 20);
    }

    @Test
    @DisplayName("M05 §7 · fold emits a single element at the end, in encounter order")
    void fold_emitsOneElement() {
        var digits = Stream.of(1, 2, 3)
                .gather(Gatherers.fold(() -> "", (text, n) -> text + n))
                .toList();

        assertThat(digits).containsExactly("123");
    }

    @Test
    @DisplayName("M05 §7 · a gatherer without a combiner gives the sequential result on a parallel stream")
    void sequentialGatherer_onParallelStream_keepsEncounterOrder() {
        var sequential = IntStream.rangeClosed(1, 1_000)
                .boxed()
                .gather(Gatherers.windowFixed(7))
                .toList();
        var parallel = IntStream.rangeClosed(1, 1_000)
                .boxed()
                .parallel()
                .gather(Gatherers.windowFixed(7))
                .toList();

        assertThat(parallel).isEqualTo(sequential);
    }
}
