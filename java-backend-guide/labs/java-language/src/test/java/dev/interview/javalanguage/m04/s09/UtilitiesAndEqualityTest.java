package dev.interview.javalanguage.m04.s09;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.ConcurrentModificationException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UtilitiesAndEqualityTest {

    private record Order(String id, String status) {}

    @Test
    @DisplayName("M04 §9 · List.sort keeps equal elements in their original order")
    void listSort_isStable() {
        List<Order> orders = new ArrayList<>(List.of(
                new Order("o1", "paid"), new Order("o2", "new"), new Order("o3", "paid"), new Order("o4", "new")));

        orders.sort(Comparator.comparing(Order::status));

        assertThat(orders).extracting(Order::id).containsExactly("o2", "o4", "o1", "o3");
    }

    @Test
    @DisplayName("M04 §9 · two stable sorts give a two-key order: secondary key first, primary key last")
    void twoStableSorts_giveTwoKeyOrder() {
        List<Order> orders = new ArrayList<>(List.of(
                new Order("o3", "paid"), new Order("o1", "new"), new Order("o4", "paid"), new Order("o2", "new")));

        orders.sort(Comparator.comparing(Order::id));
        orders.sort(Comparator.comparing(Order::status));

        assertThat(orders).extracting(Order::id).containsExactly("o1", "o2", "o3", "o4");
    }

    @Test
    @DisplayName("M04 §9 · Arrays.sort on objects is stable too")
    void arraysSortObjects_isStable() {
        Order[] orders = {new Order("o1", "paid"), new Order("o2", "new"), new Order("o3", "paid")};

        Arrays.sort(orders, Comparator.comparing(Order::status));

        assertThat(orders).extracting(Order::id).containsExactly("o2", "o1", "o3");
    }

    @Test
    @DisplayName("M04 §9 · ArrayList.sort counts as a structural modification for open iterators")
    void arrayListSort_invalidatesIterators() {
        List<Integer> list = new ArrayList<>(List.of(3, 1, 2));
        Iterator<Integer> it = list.iterator();
        it.next();

        list.sort(null);

        assertThatThrownBy(it::next).isInstanceOf(ConcurrentModificationException.class);
    }

    @Test
    @DisplayName("M04 §9 · binarySearch returns the index, or -(insertion point) - 1 when absent")
    void binarySearch_insertionPoint() {
        List<Integer> sorted = List.of(1, 3, 5);
        assertThat(Collections.binarySearch(sorted, 3)).isEqualTo(1);
        assertThat(Collections.binarySearch(sorted, 4)).isEqualTo(-3);
        assertThat(Collections.binarySearch(sorted, 0)).isEqualTo(-1);
        assertThat(Collections.binarySearch(sorted, 9)).isEqualTo(-4);
        assertThat(Arrays.binarySearch(new int[] {1, 3, 5}, 4)).isEqualTo(-3);
    }

    @Test
    @DisplayName("M04 §9 · binarySearch on an unsorted list may return a wrong index")
    void binarySearch_unsortedList_missesPresentElement() {
        // The Javadoc calls the result undefined. On JDK 25 this input sends the search right of index 0 and
        // reports 3 as absent; the test pins that observation, not a contract.
        List<Integer> unsorted = List.of(3, 1, 2);
        assertThat(unsorted).contains(3);
        assertThat(Collections.binarySearch(unsorted, 3)).isNegative();
    }

    @Test
    @DisplayName("M04 §9 · binarySearch with duplicates returns one of the equal indexes")
    void binarySearch_duplicates_anyEqualIndex() {
        List<Integer> sorted = List.of(1, 2, 2, 2, 3);
        assertThat(Collections.binarySearch(sorted, 2)).isIn(1, 2, 3);
    }

    @Test
    @DisplayName("M04 §9 · an ArrayList equals a LinkedList, a HashSet equals a TreeSet, a List never equals a Set")
    void collectionEquality_acrossImplementations() {
        List<Integer> arrayList = new ArrayList<>(List.of(1, 2, 3));
        List<Integer> linkedList = new LinkedList<>(List.of(1, 2, 3));
        assertThat(arrayList).isEqualTo(linkedList).hasSameHashCodeAs(linkedList);
        assertThat(arrayList.equals(Arrays.asList(1, 2, 3))).isTrue();
        assertThat(arrayList.equals(List.of(3, 2, 1))).isFalse();

        Set<Integer> hashSet = new HashSet<>(List.of(3, 1, 2));
        Set<Integer> treeSet = new TreeSet<>(List.of(1, 2, 3));
        assertThat(hashSet).isEqualTo(treeSet).hasSameHashCodeAs(treeSet);

        assertThat(arrayList.equals(treeSet)).isFalse();
        assertThat(treeSet.equals(arrayList)).isFalse();

        Map<String, Integer> hashMap = new HashMap<>(Map.of("a", 1, "b", 2));
        Map<String, Integer> treeMap = new TreeMap<>(Map.of("b", 2, "a", 1));
        assertThat(hashMap).isEqualTo(treeMap).hasSameHashCodeAs(treeMap);
    }

    @Test
    @DisplayName("M04 §9 · set equality uses each set's own membership test, so it can be asymmetric")
    void setEquality_canBeAsymmetric() {
        Set<String> caseInsensitive = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        caseInsensitive.add("a");
        Set<String> exact = new HashSet<>(Set.of("A"));

        assertThat(caseInsensitive.equals(exact)).isTrue();
        assertThat(exact.equals(caseInsensitive)).isFalse();
    }

    @Test
    @DisplayName("M04 §9 · Arrays.equals compares contents where equals compares identity")
    void arraysEquals_vsIdentityEquals() {
        int[] a = {1, 2, 3};
        int[] b = {1, 2, 3};
        assertThat(a.equals(b)).isFalse();
        assertThat(Arrays.equals(a, b)).isTrue();
        assertThat(Arrays.hashCode(a)).isEqualTo(Arrays.hashCode(b));

        Object[] nestedA = {new int[] {1}, "x"};
        Object[] nestedB = {new int[] {1}, "x"};
        assertThat(Arrays.equals(nestedA, nestedB)).isFalse();
        assertThat(Arrays.deepEquals(nestedA, nestedB)).isTrue();
        assertThat(Arrays.deepHashCode(nestedA)).isEqualTo(Arrays.deepHashCode(nestedB));
    }

    @Test
    @DisplayName("M04 §9 · nCopies and emptyList are immutable")
    void nCopiesAndEmptyList_areImmutable() {
        List<String> copies = Collections.nCopies(3, "x");
        assertThat(copies).containsExactly("x", "x", "x");
        assertThatThrownBy(() -> copies.add("y")).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> Collections.nCopies(-1, "x")).isInstanceOf(IllegalArgumentException.class);

        List<String> padded = new ArrayList<>(List.of("a"));
        padded.addAll(Collections.nCopies(2, "-"));
        assertThat(padded).containsExactly("a", "-", "-");

        assertThatThrownBy(() -> Collections.<String>emptyList().add("y"))
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("M04 §9 · frequency counts equal elements, reverse and shuffle work in place")
    void frequencyReverseShuffle() {
        List<String> list = new ArrayList<>(Arrays.asList("a", "b", "a", null));
        assertThat(Collections.frequency(list, "a")).isEqualTo(2);
        assertThat(Collections.frequency(list, null)).isEqualTo(1);

        Collections.reverse(list);
        assertThat(list).containsExactly(null, "a", "b", "a");

        List<Integer> numbers = new ArrayList<>(List.of(1, 2, 3, 4, 5));
        Collections.shuffle(numbers, new Random(42));
        assertThat(numbers).containsExactlyInAnyOrder(1, 2, 3, 4, 5);
    }

    @Test
    @DisplayName("M04 §9 · Arrays.fill and Arrays.sort work in place on primitive arrays")
    void arraysFillAndSort_primitives() {
        int[] values = {5, 3, 4, 1};
        Arrays.sort(values);
        assertThat(values).containsExactly(1, 3, 4, 5);

        int[] zeros = new int[3];
        Arrays.fill(zeros, 7);
        assertThat(zeros).containsExactly(7, 7, 7);
    }
}
