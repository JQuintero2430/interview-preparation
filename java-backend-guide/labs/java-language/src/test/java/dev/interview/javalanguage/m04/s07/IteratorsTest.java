package dev.interview.javalanguage.m04.s07;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.ConcurrentModificationException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class IteratorsTest {

    @Test
    @DisplayName("M04 §7 · removing in a for-each loop throws ConcurrentModificationException")
    void forEachLoop_removeThroughList_throws() {
        List<String> list = new ArrayList<>(List.of("a", "b", "c", "d"));

        assertThatThrownBy(() -> {
                    for (String s : list) {
                        if (s.equals("b")) {
                            list.remove(s);
                        }
                    }
                })
                .isInstanceOf(ConcurrentModificationException.class);
        assertThat(list).containsExactly("a", "c", "d");
    }

    @Test
    @DisplayName("M04 §7 · adding in a for-each loop throws ConcurrentModificationException")
    void forEachLoop_addThroughList_throws() {
        List<String> list = new ArrayList<>(List.of("a", "b"));

        assertThatThrownBy(() -> {
                    for (String s : list) {
                        list.add(s + "!");
                    }
                })
                .isInstanceOf(ConcurrentModificationException.class);
        assertThat(list).containsExactly("a", "b", "a!");
    }

    @Test
    @DisplayName("M04 §7 · removing the second-to-last element in a for-each loop does not throw")
    void forEachLoop_removeSecondToLast_skipsLastSilently() {
        List<String> list = new ArrayList<>(List.of("a", "b", "c"));
        List<String> visited = new ArrayList<>();

        for (String s : list) {
            visited.add(s);
            if (s.equals("b")) {
                list.remove(s); // size drops to 2 and the cursor is 2, so hasNext() is false
            }
        }

        assertThat(visited).containsExactly("a", "b");
        assertThat(list).containsExactly("a", "c");
    }

    @Test
    @DisplayName("M04 §7 · removing the last element in a for-each loop throws on the extra next()")
    void forEachLoop_removeLast_throws() {
        List<String> list = new ArrayList<>(List.of("a", "b", "c"));

        // After removing c the cursor (3) differs from the size (2), so hasNext() is true and next() checks modCount.
        assertThatThrownBy(() -> {
                    for (String s : list) {
                        if (s.equals("c")) {
                            list.remove(s);
                        }
                    }
                })
                .isInstanceOf(ConcurrentModificationException.class);
        assertThat(list).containsExactly("a", "b");
    }

    @Test
    @DisplayName("M04 §7 · Iterator.remove and removeIf remove without an exception")
    void iteratorRemove_andRemoveIf_areSafe() {
        List<Integer> viaIterator = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
        for (Iterator<Integer> it = viaIterator.iterator(); it.hasNext(); ) {
            if (it.next() % 2 == 0) {
                it.remove();
            }
        }

        List<Integer> viaRemoveIf = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
        boolean changed = viaRemoveIf.removeIf(n -> n % 2 == 0);

        assertThat(viaIterator).containsExactly(1, 3, 5);
        assertThat(viaRemoveIf).containsExactly(1, 3, 5);
        assertThat(changed).isTrue();
        assertThat(viaRemoveIf.removeIf(n -> n > 10)).isFalse();
    }

    @Test
    @DisplayName("M04 §7 · Iterator.remove needs a preceding next, once per next")
    void iteratorRemove_withoutNext_throwsIllegalState() {
        List<String> list = new ArrayList<>(List.of("a", "b"));
        Iterator<String> it = list.iterator();

        assertThatThrownBy(it::remove).isInstanceOf(IllegalStateException.class);
        it.next();
        it.remove();
        assertThatThrownBy(it::remove).isInstanceOf(IllegalStateException.class);
        assertThat(list).containsExactly("b");
    }

    @Test
    @DisplayName("M04 §7 · next past the end throws NoSuchElementException, not ConcurrentModificationException")
    void next_pastTheEnd_throwsNoSuchElement() {
        Iterator<String> it = new ArrayList<>(List.of("a")).iterator();
        it.next();

        assertThat(it.hasNext()).isFalse();
        assertThatThrownBy(it::next).isInstanceOf(NoSuchElementException.class);
    }

    @Test
    @DisplayName("M04 §7 · a ListIterator sets, adds and moves back from a cursor between elements")
    void listIterator_setAddPrevious() {
        List<String> list = new ArrayList<>(List.of("a", "b", "c"));
        ListIterator<String> it = list.listIterator();

        assertThat(it.next()).isEqualTo("a");
        it.set("A"); // replaces the element last returned
        it.add("x"); // inserts before the cursor; the next next() is still b
        assertThat(it.nextIndex()).isEqualTo(2);
        assertThat(it.previous()).isEqualTo("x");
        assertThat(it.next()).isEqualTo("x");
        assertThat(it.next()).isEqualTo("b");
        assertThat(list).containsExactly("A", "x", "b", "c");
    }

    @Test
    @DisplayName("M04 §7 · List.set during iteration is not structural and does not throw")
    void listSet_duringIteration_doesNotThrow() {
        List<String> list = new ArrayList<>(List.of("a", "b", "c"));
        int index = 0;
        for (String s : list) {
            list.set(index++, s.toUpperCase());
        }

        assertThat(list).containsExactly("A", "B", "C");
    }

    @Test
    @DisplayName("M04 §7 · ArrayList.forEach throws ConcurrentModificationException when the action adds")
    void arrayListForEach_actionModifies_throws() {
        List<String> list = new ArrayList<>(List.of("a", "b"));

        assertThatThrownBy(() -> list.forEach(s -> list.add(s + "!")))
                .isInstanceOf(ConcurrentModificationException.class);
    }

    @Test
    @DisplayName("M04 §7 · a HashMap key-set iterator fails fast when the map gains a key on the same thread")
    void hashMapKeySetIterator_putDuringIteration_throws() {
        Map<String, Integer> map = new HashMap<>(Map.of("a", 1, "b", 2, "c", 3));

        assertThatThrownBy(() -> {
                    for (String key : map.keySet()) {
                        map.put(key + key, 0);
                    }
                })
                .isInstanceOf(ConcurrentModificationException.class);
    }

    @Test
    @DisplayName("M04 §7 · a CopyOnWriteArrayList iterator does not see a later add")
    void copyOnWriteIterator_isSnapshot() {
        List<String> list = new CopyOnWriteArrayList<>(List.of("a", "b"));
        Iterator<String> it = list.iterator();

        list.add("c");
        List<String> seen = new ArrayList<>();
        it.forEachRemaining(seen::add);

        assertThat(seen).containsExactly("a", "b");
        assertThat(list).containsExactly("a", "b", "c");
    }

    @Test
    @DisplayName("M04 §7 · a CopyOnWriteArrayList iterator does not support remove")
    void copyOnWriteIterator_rejectsRemove() {
        Iterator<String> it = new CopyOnWriteArrayList<>(List.of("a")).iterator();
        it.next();

        assertThatThrownBy(it::remove).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("M04 §7 · a ConcurrentHashMap iterator is weakly consistent: no exception, original keys once each")
    void concurrentHashMapIterator_isWeaklyConsistent() {
        Map<String, Integer> map = new ConcurrentHashMap<>(Map.of("a", 1, "b", 2, "c", 3));
        List<String> visited = new ArrayList<>();

        for (String key : map.keySet()) {
            visited.add(key);
            if (key.length() == 1) {
                map.put(key + key, 0); // may or may not be visited later: both outcomes are permitted
            }
        }

        // The guarantee covers the elements present at construction: each is traversed exactly once.
        for (String original : List.of("a", "b", "c")) {
            assertThat(visited).filteredOn(original::equals).hasSize(1);
        }
        assertThat(visited).isSubsetOf("a", "b", "c", "aa", "bb", "cc");
        assertThat(map).containsKeys("aa", "bb", "cc");
    }

    @Test
    @DisplayName("M04 §7 · iteration order is the collection's own: index, insertion, sorted, head to tail")
    void iterationOrder_isDefinedByTheCollection() {
        List<String> input = List.of("pear", "apple", "fig");

        assertThat(new ArrayList<>(input)).containsExactly("pear", "apple", "fig");
        assertThat(new LinkedHashSet<>(input)).containsExactly("pear", "apple", "fig");
        assertThat(new TreeSet<>(input)).containsExactly("apple", "fig", "pear");
        ArrayDeque<String> stack = new ArrayDeque<>();
        input.forEach(stack::push);
        assertThat(stack).containsExactly("fig", "apple", "pear");
        Set<String> hashed = new HashSet<>(input);
        assertThat(hashed).containsExactlyInAnyOrderElementsOf(input);
    }
}
