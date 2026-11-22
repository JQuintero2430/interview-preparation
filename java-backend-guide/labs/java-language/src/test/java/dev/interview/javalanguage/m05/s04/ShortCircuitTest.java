package dev.interview.javalanguage.m05.s04;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ShortCircuitTest {

    @Test
    @DisplayName("M05 §4 · findFirst on an infinite iterate stops after the first match")
    void findFirst_onInfiniteIterate_visitsOnlyUpToTheFirstMatch() {
        List<String> events = new ArrayList<>();

        var first = Pipelines.firstMultipleOf(7, events);

        assertThat(first).contains(7);
        assertThat(events).containsExactly("visit 1", "visit 2", "visit 3", "visit 4", "visit 5", "visit 6", "visit 7");
    }

    @Test
    @DisplayName("M05 §4 · limit on an infinite iterate visits exactly n elements")
    void limit_onInfiniteIterate_visitsExactlyN() {
        List<String> events = new ArrayList<>();

        var firstThree = Pipelines.firstN(3, events);

        assertThat(firstThree).containsExactly(1, 2, 3);
        assertThat(events).containsExactly("visit 1", "visit 2", "visit 3");
    }

    @Test
    @DisplayName("M05 §4 · takeWhile on an infinite iterate stops at the first element that fails")
    void takeWhile_onInfiniteIterate_visitsTheFirstFailingElementAndStops() {
        List<String> events = new ArrayList<>();

        var belowFour = Pipelines.whileBelow(4, events);

        assertThat(belowFour).containsExactly(1, 2, 3);
        assertThat(events).containsExactly("visit 1", "visit 2", "visit 3", "visit 4");
    }
}
