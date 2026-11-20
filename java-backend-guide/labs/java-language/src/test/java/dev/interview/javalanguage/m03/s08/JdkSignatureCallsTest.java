package dev.interview.javalanguage.m03.s08;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Module 03 §8: each wildcard in a JDK signature is there so that one of these calls compiles.
class JdkSignatureCallsTest {

    private static final LocalDate MARCH_1 = LocalDate.of(2026, 3, 1);
    private static final LocalDate MARCH_9 = LocalDate.of(2026, 3, 9);
    private static final LocalDate MARCH_5 = LocalDate.of(2026, 3, 5);
    private static final String PREFIX = "EU";
    private static final String FIRST = "EU-1";
    private static final String SECOND = "EU-2";

    @Test
    @DisplayName("M03 §8 · Collections.max accepts List<LocalDate> because its bound is Comparable<? super T>")
    void latestShipDate_returnsMaximum_whenElementsInheritComparable() {
        assertThat(Shipments.latestShipDate(List.of(MARCH_1, MARCH_9, MARCH_5))).isEqualTo(MARCH_9);
    }

    @Test
    @DisplayName("M03 §8 · Stream<T>.collect accepts a Collector written for a supertype of T")
    void describingAnything_collectsStreamsOfDifferentTypes_whenCollectorConsumesObject() {
        assertThat(Stream.of(1, 2, 3).collect(Shipments.describingAnything())).isEqualTo("1, 2, 3");
        assertThat(Stream.of(MARCH_1).collect(Shipments.describingAnything())).isEqualTo("2026-03-01");
    }

    @Test
    @DisplayName("M03 §8 · computeIfAbsent takes a Function<? super K, ? extends V>")
    void index_reusesBucketCreatedByWiderFunction_whenKeyRepeats() {
        Map<String, List<String>> byPrefix = new HashMap<>();

        Shipments.index(byPrefix, PREFIX, FIRST);
        Shipments.index(byPrefix, PREFIX, SECOND);

        assertThat(byPrefix.get(PREFIX)).isInstanceOf(ArrayList.class).containsExactly(FIRST, SECOND);
    }

    @Test
    @DisplayName("M03 §8 · Comparator.comparing accepts a LocalDate key because U extends Comparable<? super U>")
    void byShipDate_sortsAscending_whenKeyIsLocalDate() {
        Parcel late = new Parcel("p-9", MARCH_9);
        Parcel early = new Parcel("p-1", MARCH_1);
        Parcel middle = new Parcel("p-5", MARCH_5);

        assertThat(Shipments.byShipDate(List.of(late, early, middle))).containsExactly(early, middle, late);
    }
}
