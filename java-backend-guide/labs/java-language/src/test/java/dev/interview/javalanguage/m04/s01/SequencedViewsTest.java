package dev.interview.javalanguage.m04.s01;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.SequencedMap;
import java.util.TreeMap;
import java.util.TreeSet;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SequencedViewsTest {

    private static final List<String> EVENTS = List.of("login", "search", "checkout");
    private static final String NEWEST = "checkout";

    @Test
    @DisplayName("M04 §1 · newest returns the last element of a List, a Deque and a LinkedHashSet")
    void newest_returnsLastElement_forEverySequencedCollection() {
        assertThat(SequencedViews.newest(new ArrayList<>(EVENTS))).isEqualTo(NEWEST);
        assertThat(SequencedViews.newest(new ArrayDeque<>(EVENTS))).isEqualTo(NEWEST);
        assertThat(SequencedViews.newest(new LinkedHashSet<>(EVENTS))).isEqualTo(NEWEST);
    }

    @Test
    @DisplayName("M04 §1 · the pre-Java 21 walk over a LinkedHashSet finds the same element as getLast")
    void newestBeforeJava21_matchesGetLast_forLinkedHashSet() {
        LinkedHashSet<String> events = new LinkedHashSet<>(EVENTS);

        assertThat(SequencedViews.newestBeforeJava21(events)).isEqualTo(events.getLast());
    }

    @Test
    @DisplayName("M04 §1 · reversed() is a live view of a List")
    void reversed_reflectsAndWritesThrough_toTheBackingList() {
        List<String> events = new ArrayList<>(EVENTS);
        List<String> newestFirst = events.reversed();

        events.add("logout");
        newestFirst.addFirst("timeout");

        assertThat(newestFirst).containsExactly("timeout", "logout", "checkout", "search", "login");
        assertThat(events).endsWith("timeout");
    }

    @Test
    @DisplayName("M04 §1 · newestFirst copies at most limit elements, newest first")
    void newestFirst_returnsLimitedReverseCopy() {
        List<String> copy = SequencedViews.newestFirst(new ArrayList<>(EVENTS), 2);

        assertThat(copy).containsExactly("checkout", "search");
    }

    @Test
    @DisplayName("M04 §1 · LinkedHashMap.putLast moves an existing key to the end")
    void touch_movesExistingKeyToEnd_inLinkedHashMap() {
        SequencedMap<String, Integer> recent = new LinkedHashMap<>();
        recent.put("a", 1);
        recent.put("b", 2);
        recent.put("c", 3);

        SequencedViews.touch(recent, "a", 10);

        assertThat(recent.sequencedKeySet()).containsExactly("b", "c", "a");
        assertThat(recent.lastEntry().getValue()).isEqualTo(10);
    }

    @Test
    @DisplayName("M04 §1 · putLast on a TreeMap throws UnsupportedOperationException")
    void touch_throws_whenMapIsSortedByComparator() {
        SequencedMap<String, Integer> sorted = new TreeMap<>();

        assertThatThrownBy(() -> SequencedViews.touch(sorted, "a", 1))
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("M04 §1 · a TreeSet is sequenced but rejects addFirst")
    void treeSet_supportsGetFirst_butRejectsExplicitPositioning() {
        TreeSet<String> sorted = new TreeSet<>(EVENTS);

        assertThat(sorted.getFirst()).isEqualTo("checkout");
        assertThatThrownBy(() -> sorted.addFirst("aaa")).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("M04 §1 · getLast on an empty collection throws NoSuchElementException")
    void newest_throws_whenCollectionIsEmpty() {
        assertThatThrownBy(() -> SequencedViews.newest(new ArrayList<String>()))
                .isInstanceOf(NoSuchElementException.class);
    }
}
