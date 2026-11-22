package dev.interview.javalanguage.m05.s07;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Gatherers;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CustomGathererTest {

    @Test
    @DisplayName("M05 §7 · an integrator returning false short-circuits an infinite stream")
    void integratorReturningFalse_stopsInfiniteStream() {
        List<Integer> pulled = new ArrayList<>();

        var affordable = Stream.iterate(100, price -> price + 100)
                .peek(pulled::add)
                .gather(Budget.<Integer>withinBudget(1_000, price -> price))
                .toList();

        assertThat(affordable).containsExactly(100, 200, 300, 400);
        // 100 + 200 + 300 + 400 = 1,000; the fifth price (500) exceeds the budget and ends the stream.
        assertThat(pulled).containsExactly(100, 200, 300, 400, 500);
    }

    @Test
    @DisplayName("M05 §7 · state comes from the initializer, so one gatherer instance serves two pipelines")
    void stateFromInitializer_isNotSharedBetweenPipelines() {
        var gatherer = Budget.<Integer>withinBudget(5, n -> n);

        var first = Stream.of(1, 2, 3).gather(gatherer).toList();
        var second = Stream.of(1, 2, 3).gather(gatherer).toList();

        assertThat(first).containsExactly(1, 2);
        assertThat(second).isEqualTo(first);
    }

    @Test
    @DisplayName("M05 §7 · a stateless Gatherer.of works on a parallel stream and keeps encounter order")
    void parallelizableGatherer_keepsOrder() {
        var squares = IntStream.rangeClosed(1, 1_000)
                .boxed()
                .parallel()
                .gather(Budget.mapping((Integer n) -> n * n))
                .toList();

        assertThat(squares).hasSize(1_000).startsWith(1, 4, 9).endsWith(1_000_000);
    }

    @Test
    @DisplayName("M05 §7 · andThen chains two gatherers into one")
    void andThen_composesGatherers() {
        var pairSums = Stream.of(1, 2, 3, 4, 5)
                .gather(Gatherers.<Integer>windowFixed(2)
                        .andThen(Budget.mapping((List<Integer> pair) ->
                                pair.stream().mapToInt(Integer::intValue).sum())))
                .toList();

        assertThat(pairSums).containsExactly(3, 7, 5);
    }
}
