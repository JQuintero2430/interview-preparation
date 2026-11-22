package dev.interview.javalanguage.m05.s04;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalStateException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.ConcurrentModificationException;
import java.util.HashSet;
import java.util.List;
import java.util.Spliterator;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class StreamRulesTest {

    @Test
    @DisplayName("M05 §4 · reusing a stream throws IllegalStateException")
    void reusingAConsumedStream_throwsIllegalStateException() {
        Stream<String> words = Stream.of("a", "b");
        words.count();

        assertThatIllegalStateException()
                .isThrownBy(words::count)
                .withMessage("stream has already been operated upon or closed");
    }

    @Test
    @DisplayName("M05 §4 · attaching a second operation to the same stage throws IllegalStateException")
    void branchingFromOneStage_throwsIllegalStateException() {
        Stream<String> words = Stream.of("a", "b");
        words.filter(w -> w.startsWith("a"));

        assertThatIllegalStateException()
                .isThrownBy(() -> words.map(String::toUpperCase))
                .withMessage("stream has already been operated upon or closed");
    }

    @Test
    @DisplayName("M05 §4 · a change to an ArrayList before the terminal operation is seen by the stream")
    void sourceChangedBeforeTerminalOperation_isReflected() {
        List<String> list = new ArrayList<>(List.of("one", "two"));
        Stream<String> stream = list.stream();
        list.add("three");

        assertThat(stream.collect(Collectors.joining(" "))).isEqualTo("one two three");
    }

    @Test
    @DisplayName("M05 §4 · modifying an ArrayList source during the pipeline throws ConcurrentModificationException")
    void sourceModifiedDuringPipeline_throwsConcurrentModificationException() {
        List<Integer> list = new ArrayList<>(List.of(1, 2, 3));

        assertThatThrownBy(() -> list.stream().forEach(n -> list.add(n * 10)))
                .isInstanceOf(ConcurrentModificationException.class);
    }

    @Test
    @DisplayName("M05 §4 · a List source is ORDERED and a HashSet source is not")
    void encounterOrder_comesFromTheSource() {
        Spliterator<Integer> fromList = List.of(3, 1, 2).stream().spliterator();
        Spliterator<Integer> fromSet = new HashSet<>(List.of(3, 1, 2)).stream().spliterator();

        assertThat(fromList.hasCharacteristics(Spliterator.ORDERED)).isTrue();
        assertThat(fromSet.hasCharacteristics(Spliterator.ORDERED)).isFalse();
    }

    @Test
    @DisplayName("M05 §4 · sorted gives an unordered source an encounter order")
    void sorted_imposesAnEncounterOrder() {
        var sorted = new HashSet<>(List.of(30, 10, 20)).stream().sorted();

        assertThat(sorted.spliterator().hasCharacteristics(Spliterator.ORDERED)).isTrue();
    }

    @Test
    @DisplayName("M05 §4 · unordered() clears ORDERED from a List stream")
    void unordered_clearsTheOrderedCharacteristic() {
        var unordered = List.of(3, 1, 2).stream().unordered();

        assertThat(unordered.spliterator().hasCharacteristics(Spliterator.ORDERED))
                .isFalse();
    }
}
