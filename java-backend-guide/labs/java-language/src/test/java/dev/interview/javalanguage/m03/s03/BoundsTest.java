package dev.interview.javalanguage.m03.s03;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Each method is called with two element types because a bound is only interesting if more than one type fits it.
class BoundsTest {

    private static final double SUM_OF_INTEGERS = 6.0;
    private static final double SUM_OF_DOUBLES = 4.0;
    private static final double EMPTY_SUM = 0.0;
    private static final int LOW = 1;
    private static final int HIGH = 10;
    private static final int INSIDE = 5;
    private static final int BELOW = -3;
    private static final int ABOVE = 42;
    private static final LocalDate EARLIEST = LocalDate.of(2026, 1, 15);
    private static final LocalDate MIDDLE = LocalDate.of(2026, 6, 1);
    private static final LocalDate LATEST = LocalDate.of(2026, 11, 16);

    @Test
    @DisplayName("M03 §3 · an upper bound lets the body call the bound's methods")
    void sum_addsDoubleValues_whenElementsAreAnyNumberType() {
        assertThat(Bounds.sum(List.of(1, 2, 3))).isEqualTo(SUM_OF_INTEGERS);
        assertThat(Bounds.sum(List.of(1.5, 2.5))).isEqualTo(SUM_OF_DOUBLES);
        assertThat(Bounds.sum(List.<Integer>of())).isEqualTo(EMPTY_SUM);
    }

    @Test
    @DisplayName("M03 §3 · multiple bounds give the body both Number and Comparable")
    void clamp_returnsValueOrNearestLimit_whenValueIsInsideBelowOrAbove() {
        assertThat(Bounds.clamp(INSIDE, LOW, HIGH)).isEqualTo(INSIDE);
        assertThat(Bounds.clamp(BELOW, LOW, HIGH)).isEqualTo(LOW);
        assertThat(Bounds.clamp(ABOVE, LOW, HIGH)).isEqualTo(HIGH);
    }

    @Test
    @DisplayName("M03 §3 · max with Comparable<? super T> accepts a List<LocalDate>")
    void max_returnsLatestDate_whenElementsAreLocalDates() {
        assertThat(Bounds.max(List.of(MIDDLE, LATEST, EARLIEST))).isEqualTo(LATEST);
        assertThat(Bounds.max(List.of(EARLIEST))).isEqualTo(EARLIEST);
    }

    @Test
    @DisplayName("M03 §3 · max of an empty list throws NoSuchElementException")
    void max_throwsNoSuchElementException_whenListIsEmpty() {
        assertThatThrownBy(() -> Bounds.max(List.<LocalDate>of())).isInstanceOf(NoSuchElementException.class);
    }
}
