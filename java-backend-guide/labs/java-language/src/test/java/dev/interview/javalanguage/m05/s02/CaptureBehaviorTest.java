package dev.interview.javalanguage.m05.s02;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import java.util.function.IntSupplier;
import java.util.stream.IntStream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CaptureBehaviorTest {

    private static final List<String> WORDS = List.of("map", "filter", "reduce", "of", "collect");

    @Test
    @DisplayName("M05 §2 · a lambda reading a field sees the field's current value, a captured local keeps its value")
    void fieldRead_seesUpdates_capturedLocal_keepsSnapshot() {
        var tag = new PriceTag(1_000);
        IntSupplier current = tag.currentPrice();
        IntSupplier atCreation = tag.priceAtCreation();

        tag.reprice(1_250);

        assertThat(current.getAsInt()).isEqualTo(1_250);
        assertThat(atCreation.getAsInt()).isEqualTo(1_000);
    }

    @Test
    @DisplayName("M05 §2 · effectively final fixes the variable, not the object it refers to")
    void capturedList_canStillBeMutated() {
        List<String> seen = new ArrayList<>();
        Runnable record = () -> seen.add("called");

        record.run();
        record.run();

        assertThat(seen).containsExactly("called", "called");
    }

    @Test
    @DisplayName("M05 §2 · sequentially, the array-holder workaround and the stream count agree")
    void arrayHolder_matchesStreamCount_sequentially() {
        assertThat(WordTally.countWithArrayHolder(WORDS.stream(), 6)).isEqualTo(3);
        assertThat(WordTally.countWithStream(WORDS.stream(), 6)).isEqualTo(3);
    }

    @Test
    @DisplayName("M05 §2 · in parallel, only the stream count and the atomic counter are exact")
    void parallel_onlyStreamCountAndAtomicAreExact() {
        List<String> many = IntStream.range(0, 20_000).mapToObj(i -> "word" + i).toList();

        int holder = WordTally.countWithArrayHolder(many.parallelStream(), 1);

        // Lost updates depend on scheduling: the permitted results are 1..20000, never more.
        assertThat(holder).isBetween(1, many.size());
        assertThat(WordTally.countWithAtomic(many.parallelStream(), 1)).isEqualTo(many.size());
        assertThat(WordTally.countWithStream(many.parallelStream(), 1)).isEqualTo(many.size());
    }
}
