package dev.interview.javalanguage.m04.s02;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.LinkedList;
import java.util.List;
import java.util.RandomAccess;
import java.util.Stack;
import java.util.Vector;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ListInternalsTest {

    private static final int DEFAULT_CAPACITY = 10;

    // modCount is a protected field of AbstractList, so a subclass can read it without --add-opens.
    private static final class CountingList<E> extends ArrayList<E> {
        int structuralChanges() {
            return modCount;
        }
    }

    @Test
    @DisplayName("M04 §2 · remove(int) and remove(Object) on a List<Integer> remove different elements")
    void remove_choosesIndexOrValue_byStaticArgumentType() {
        List<Integer> byIndex = new ArrayList<>(List.of(10, 20, 30));
        List<Integer> byValue = new ArrayList<>(List.of(10, 20, 30));

        byIndex.remove(1);
        byValue.remove(Integer.valueOf(10));

        assertThat(byIndex).containsExactly(10, 30);
        assertThat(byValue).containsExactly(20, 30);
    }

    @Test
    @DisplayName("M04 §2 · indexOf returns the first index, and -1 for a missing value without removing anything")
    void indexOf_returnsFirstIndexOrMinusOne_andLeavesListUnchanged() {
        List<String> codes = new ArrayList<>(List.of("a", "b", "a"));

        assertThat(codes.indexOf("a")).isZero();
        assertThat(codes.lastIndexOf("a")).isEqualTo(2);
        assertThat(codes.indexOf("z")).isEqualTo(-1);
        assertThat(codes).containsExactly("a", "b", "a");
    }

    @Test
    @DisplayName("M04 §2 · ArrayList is RandomAccess and LinkedList is not")
    void randomAccessMarker_separatesArrayListFromLinkedList() {
        assertThat(new ArrayList<String>()).isInstanceOf(RandomAccess.class);
        assertThat(new LinkedList<String>()).isNotInstanceOf(RandomAccess.class);
    }

    @Test
    @DisplayName("M04 §2 · add(index, e) shifts the later elements one place to the right")
    void addAtIndex_shiftsLaterElements() {
        List<String> steps = new ArrayList<>(List.of("a", "c", "d"));

        steps.add(1, "b");

        assertThat(steps).containsExactly("a", "b", "c", "d");
    }

    @Test
    @DisplayName("M04 §2 · add and trimToSize count as structural changes, set does not")
    void modCount_countsStructuralChangesOnly() {
        CountingList<String> list = new CountingList<>();
        list.add("a");
        int afterAdd = list.structuralChanges();

        list.set(0, "b");
        int afterSet = list.structuralChanges();
        list.trimToSize();

        assertThat(afterAdd).isEqualTo(1);
        assertThat(afterSet).isEqualTo(afterAdd);
        assertThat(list.structuralChanges()).isEqualTo(afterSet + 1);
    }

    @Test
    @DisplayName("M04 §2 · an initial capacity is not a size: set(0) on new ArrayList<>(100) throws")
    void initialCapacity_doesNotCreateElements() {
        List<String> presized = new ArrayList<>(100);

        assertThat(presized).isEmpty();
        assertThatThrownBy(() -> presized.set(0, "a")).isInstanceOf(IndexOutOfBoundsException.class);
    }

    @Test
    @DisplayName("M04 §2 · Vector doubles its capacity unless a capacity increment is given")
    void vector_doublesCapacity_orGrowsByIncrement() {
        Vector<Integer> doubling = new Vector<>();
        Vector<Integer> stepping = new Vector<>(DEFAULT_CAPACITY, 5);
        for (int i = 0; i <= DEFAULT_CAPACITY; i++) {
            doubling.add(i);
            stepping.add(i);
        }

        assertThat(doubling.capacity()).isEqualTo(20);
        assertThat(stepping.capacity()).isEqualTo(15);
    }

    @Test
    @DisplayName("M04 §2 · a Stack iterates bottom first, an ArrayDeque used as a stack iterates top first")
    void stackAndDeque_iterateInOppositeOrders() {
        Stack<Integer> legacy = new Stack<>();
        Deque<Integer> modern = new ArrayDeque<>();
        for (int i = 1; i <= 3; i++) {
            legacy.push(i);
            modern.push(i);
        }

        assertThat(legacy.peek()).isEqualTo(modern.peek()).isEqualTo(3);
        assertThat(legacy).containsExactly(1, 2, 3);
        assertThat(modern).containsExactly(3, 2, 1);
    }
}
