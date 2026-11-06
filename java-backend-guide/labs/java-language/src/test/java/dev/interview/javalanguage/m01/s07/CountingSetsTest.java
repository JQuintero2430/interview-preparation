package dev.interview.javalanguage.m01.s07;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashSet;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins the fragile-base-class result module 01 §7 states: inheritance double-counts, forwarding does not.
class CountingSetsTest {

    private static final List<String> THREE = List.of("a", "b", "c");

    @Test
    @DisplayName("M01 §7 · counting HashSet subclass double-counts addAll")
    void countingHashSet_doubleCounts_whenAddAllCallsTheOverriddenAdd() {
        var set = new CountingHashSet<String>();

        set.addAll(THREE);

        assertThat(set.addCount()).isEqualTo(6);
        assertThat(set).hasSize(3);
    }

    @Test
    @DisplayName("M01 §7 · forwarding wrapper counts correctly")
    void countingSet_countsEachElementOnce_whenForwardingAddAll() {
        var set = new CountingSet<String>(new HashSet<>());

        set.addAll(THREE);

        assertThat(set.addCount()).isEqualTo(3);
        assertThat(set).hasSize(3).contains("a", "b", "c");
    }
}
