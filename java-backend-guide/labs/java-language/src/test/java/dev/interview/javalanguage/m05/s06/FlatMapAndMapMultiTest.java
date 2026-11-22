package dev.interview.javalanguage.m05.s06;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class FlatMapAndMapMultiTest {

    private static final List<Order> ORDERS = List.of(
            new Order("o1", List.of(new Line("pen", 2, 150), new Line("ink", 0, 900))),
            new Order("o2", List.of()),
            new Order("o3", List.of(new Line("pad", 3, 400), new Line("pen", 1, 150))));

    @Test
    @DisplayName("M05 §6 · flatMap and mapMulti produce the same elements")
    void flatMapAndMapMulti_produceSameElements() {
        var viaFlatMap = Expansions.shippableLinesWithFlatMap(ORDERS);
        var viaMapMulti = Expansions.shippableLinesWithMapMulti(ORDERS);

        assertThat(viaFlatMap).extracting(Line::sku).containsExactly("pen", "pad", "pen");
        assertThat(viaMapMulti).isEqualTo(viaFlatMap);
    }

    @Test
    @DisplayName("M05 §6 · mapMulti can keep only one subtype, like instanceof plus a cast")
    void mapMulti_filtersAndCastsInOneStep() {
        List<Object> mixed = List.of(1, "two", 3L, 4);

        List<Integer> ints = Expansions.onlyIntegers(mixed);

        assertThat(ints).containsExactly(1, 4);
    }

    @Test
    @DisplayName("M05 §6 · flatMap closes each mapped stream after using it")
    void flatMap_closesEachMappedStream() {
        List<String> closed = new ArrayList<>();

        var letters = Stream.of("a", "b")
                .flatMap(s -> Stream.of(s, s.toUpperCase()).onClose(() -> closed.add(s)))
                .toList();

        assertThat(letters).containsExactly("a", "A", "b", "B");
        assertThat(closed).containsExactly("a", "b");
    }

    @Test
    @DisplayName("M05 §6 · with findFirst, flatMap stops its inner stream early; mapMulti's mapper still pushes all")
    void shortCircuit_stopsFlatMapButNotMapMultiLoop() {
        List<Integer> producedByFlatMap = new ArrayList<>();
        List<Integer> producedByMapMulti = new ArrayList<>();

        var first = Stream.of("x")
                .flatMap(s ->
                        IntStream.rangeClosed(1, 5).peek(producedByFlatMap::add).boxed())
                .findFirst();
        var firstMulti = Stream.of("x")
                .<Integer>mapMulti((s, sink) -> {
                    for (int i = 1; i <= 5; i++) {
                        producedByMapMulti.add(i);
                        sink.accept(i);
                    }
                })
                .findFirst();

        assertThat(first).contains(1);
        assertThat(firstMulti).contains(1);
        assertThat(producedByFlatMap).containsExactly(1);
        assertThat(producedByMapMulti).containsExactly(1, 2, 3, 4, 5);
    }
}
