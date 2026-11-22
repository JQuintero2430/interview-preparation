package dev.interview.javalanguage.m04.ex3;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.ConcurrentModificationException;
import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class GrowableListTest {

    private static GrowableList<String> listOf(String... values) {
        GrowableList<String> list = new GrowableList<>();
        for (String value : values) {
            list.add(value);
        }
        return list;
    }

    private static List<String> contents(GrowableList<String> list) {
        List<String> copy = new ArrayList<>();
        list.forEach(copy::add);
        return copy;
    }

    @Test
    @DisplayName("Ex04.3 · (1) add beyond capacity grows the array by half (4 → 6 → 9, 10 → 15, 1 → 2) and keeps order")
    void growsByHalfAndKeepsOrder() {
        GrowableList<Integer> list = new GrowableList<>(4);
        for (int i = 0; i < 4; i++) {
            list.add(i);
        }
        assertThat(list.capacity()).isEqualTo(4);
        list.add(4);
        assertThat(list.capacity()).isEqualTo(6);
        list.add(5);
        list.add(6);
        assertThat(list.capacity()).isEqualTo(9);
        for (int i = 0; i < 7; i++) {
            assertThat(list.get(i)).isEqualTo(i);
        }

        GrowableList<String> byDefault = listOf("0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
        assertThat(byDefault.capacity()).isEqualTo(10);
        byDefault.add("10");
        assertThat(byDefault.capacity()).isEqualTo(15);

        GrowableList<String> tiny = new GrowableList<>(1);
        tiny.add("a");
        tiny.add("b");
        assertThat(tiny.capacity())
                .as("1 >> 1 is 0, so growth is at least one slot")
                .isEqualTo(2);
        assertThat(contents(tiny)).containsExactly("a", "b");
    }

    @Test
    @DisplayName(
            "Ex04.3 · (2) add or remove during iteration makes the next next() throw CME, even if the size is back")
    void structuralChangeBreaksTheIterator() {
        GrowableList<String> list = listOf("a", "b", "c");
        Iterator<String> added = list.iterator();
        added.next();
        list.add("d");
        assertThatThrownBy(added::next).isInstanceOf(ConcurrentModificationException.class);

        Iterator<String> removed = list.iterator();
        removed.next();
        list.remove(0);
        assertThat(removed.hasNext()).isTrue();
        assertThatThrownBy(removed::next).isInstanceOf(ConcurrentModificationException.class);

        Iterator<String> sameSize = list.iterator();
        sameSize.next();
        list.add("e");
        list.remove(list.size() - 1);
        assertThatThrownBy(sameSize::next)
                .as("the counter, not the size, detects the change")
                .isInstanceOf(ConcurrentModificationException.class);
    }

    @Test
    @DisplayName(
            "Ex04.3 · (2) a for-each loop that removes the second-to-last element ends silently, as with ArrayList")
    void secondToLastRemovalEndsTheLoopSilently() {
        GrowableList<String> list = listOf("a", "b", "c");
        List<String> visited = new ArrayList<>();

        for (String value : list) {
            visited.add(value);
            if (value.equals("b")) {
                list.remove(1);
            }
        }

        assertThat(visited).containsExactly("a", "b");
        assertThat(contents(list)).containsExactly("a", "c");
    }

    @Test
    @DisplayName("Ex04.3 · (3) Iterator.remove removes the last returned element, and iteration goes on without CME")
    void iteratorRemoveIsSafe() {
        GrowableList<String> list = listOf("a", "b", "c", "d");
        List<String> visited = new ArrayList<>();

        Iterator<String> iterator = list.iterator();
        while (iterator.hasNext()) {
            String value = iterator.next();
            visited.add(value);
            if (value.equals("b") || value.equals("c")) {
                iterator.remove();
            }
        }

        assertThat(visited).containsExactly("a", "b", "c", "d");
        assertThat(contents(list)).containsExactly("a", "d");
        assertThat(list.size()).isEqualTo(2);
    }

    @Test
    @DisplayName(
            "Ex04.3 · (4) remove without a preceding next throws ISE; next past the end throws NoSuchElementException")
    void removeWithoutNextIsIllegal() {
        GrowableList<String> list = listOf("a", "b");
        Iterator<String> iterator = list.iterator();

        assertThatThrownBy(iterator::remove).isInstanceOf(IllegalStateException.class);
        iterator.next();
        iterator.remove();
        assertThatThrownBy(iterator::remove).isInstanceOf(IllegalStateException.class);
        assertThat(contents(list)).containsExactly("b");

        iterator.next();
        assertThat(iterator.hasNext()).isFalse();
        assertThatThrownBy(iterator::next).isInstanceOf(NoSuchElementException.class);
    }

    @Test
    @DisplayName("Ex04.3 · (5) set during iteration is not structural: no CME, and the loop sees the new value")
    void setDuringIterationDoesNotThrow() {
        GrowableList<String> list = listOf("a", "b", "c");
        List<String> visited = new ArrayList<>();

        for (String value : list) {
            visited.add(value);
            if (value.equals("a")) {
                list.set(0, "A");
                list.set(2, "C");
            }
        }

        assertThat(visited).containsExactly("a", "b", "C");
        assertThat(contents(list)).containsExactly("A", "b", "C");
    }
}
