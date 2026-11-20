package dev.interview.javalanguage.m04.s02;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.IntStream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ListAccessTest {

    private static final List<Integer> NUMBERS = IntStream.range(0, 10).boxed().toList();

    @Test
    @DisplayName("M04 §2 · everyNth returns the same elements for an ArrayList and a LinkedList")
    void everyNth_agreesForRandomAndSequentialAccessLists() {
        List<Integer> fromArray = ListAccess.everyNth(new ArrayList<>(NUMBERS), 3);
        List<Integer> fromLinked = ListAccess.everyNth(new LinkedList<>(NUMBERS), 3);

        assertThat(fromArray).containsExactly(0, 3, 6, 9);
        assertThat(fromLinked).isEqualTo(fromArray);
    }

    @Test
    @DisplayName("M04 §2 · everyNth rejects a step below 1")
    void everyNth_rejectsNonPositiveStep() {
        assertThatThrownBy(() -> ListAccess.everyNth(NUMBERS, 0)).isInstanceOf(IllegalArgumentException.class);
    }
}
