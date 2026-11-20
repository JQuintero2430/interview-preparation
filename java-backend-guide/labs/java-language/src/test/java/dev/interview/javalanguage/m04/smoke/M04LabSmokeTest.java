package dev.interview.javalanguage.m04.smoke;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class M04LabSmokeTest {

    private static final int INITIAL_CAPACITY = 16;
    private static final float LOAD_FACTOR = 0.75f;
    private static final boolean ACCESS_ORDER = true;

    @Test
    @DisplayName("M04 smoke · List.of rejects a null element")
    void listOf_throwsNullPointerException_whenAnElementIsNull() {
        assertThatThrownBy(() -> List.of("a", null)).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("M04 smoke · an ArrayList and a LinkedList with the same elements are equal")
    void arrayListAndLinkedList_areEqual_whenElementsMatchInOrder() {
        List<String> array = new ArrayList<>(List.of("a", "b", "c"));
        List<String> linked = new LinkedList<>(List.of("a", "b", "c"));

        assertThat(array).isEqualTo(linked);
        assertThat(array.hashCode()).isEqualTo(linked.hashCode());
    }

    @Test
    @DisplayName("M04 smoke · an access-order LinkedHashMap moves a read key to the end")
    void accessOrderLinkedHashMap_movesKeyToEnd_whenKeyIsRead() {
        Map<String, Integer> map = new LinkedHashMap<>(INITIAL_CAPACITY, LOAD_FACTOR, ACCESS_ORDER);
        map.put("a", 1);
        map.put("b", 2);
        map.put("c", 3);

        map.get("a");

        assertThat(map.keySet()).containsExactly("b", "c", "a");
    }
}
