package dev.interview.javalanguage.m04.outputs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import java.lang.ref.WeakReference;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.LinkedList;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Stack;
import java.util.WeakHashMap;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Claims of Q04.18, Q04.21, Q04.22 and Q04.24 that the answers state as lab results.
class Q04QueuesAndIteratorsTest {

    private static final int MAX_GC_ATTEMPTS = 10;

    // A cached value that keeps a strong reference to its own key, the leak of Q04.18.
    private record Metadata(Object owner) {}

    @Test
    @DisplayName(
            "Q04.18 · an entry whose value refers to its key survives collections that clear an unrelated weak reference")
    void q04_18_valueThatRefersToItsKeyPinsTheEntry() {
        Map<Object, Metadata> cache = new WeakHashMap<>();
        putSelfReferencingEntry(cache);
        WeakReference<Object> probe = new WeakReference<>(new Object());
        for (int i = 0; i < MAX_GC_ATTEMPTS && probe.get() != null; i++) {
            System.gc();
        }

        assumeTrue(probe.get() == null, "no garbage collection cleared the probe");
        assertThat(cache).hasSize(1);
    }

    private static void putSelfReferencingEntry(Map<Object, Metadata> cache) {
        Object key = new Object();
        cache.put(key, new Metadata(key));
    }

    @Test
    @DisplayName("Q04.21 · the constructor heapifies, so [3, 2, 1] is laid out differently from three offers")
    void q04_21_heapifyAndOffersCanDiffer() {
        PriorityQueue<Integer> offered = new PriorityQueue<>();
        List.of(3, 2, 1).forEach(offered::offer);
        PriorityQueue<Integer> heapified = new PriorityQueue<>(List.of(3, 2, 1));

        assertThat(offered).hasToString("[1, 3, 2]");
        assertThat(heapified).hasToString("[1, 2, 3]");
    }

    @Test
    @DisplayName("Q04.22 · after push 1, 2, 3 a Stack iterates bottom first, ArrayDeque and LinkedList top first")
    void q04_22_stackIterationOrder() {
        Stack<Integer> stack = new Stack<>();
        Deque<Integer> arrayDeque = new ArrayDeque<>();
        Deque<Integer> linkedList = new LinkedList<>();
        for (int i = 1; i <= 3; i++) {
            stack.push(i);
            arrayDeque.push(i);
            linkedList.push(i);
        }

        assertThat(stack).containsExactly(1, 2, 3);
        assertThat(arrayDeque).containsExactly(3, 2, 1);
        assertThat(linkedList).containsExactly(3, 2, 1);
        assertThat(List.of(stack.peek(), arrayDeque.peek(), linkedList.peek())).containsExactly(3, 3, 3);
    }

    @Test
    @DisplayName("Q04.22 · Stack and LinkedList accept a pushed null, ArrayDeque rejects it")
    void q04_22_nullElements() {
        Stack<String> stack = new Stack<>();
        Deque<String> linkedList = new LinkedList<>();
        stack.push(null);
        linkedList.push(null);

        assertThat(stack).containsExactly((String) null);
        assertThat(linkedList.pop()).isNull();
        assertThatThrownBy(() -> new ArrayDeque<String>().push(null)).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("Q04.24 · set replaces the element next returned and add inserts after it, before the cursor")
    void q04_24_setAndAddThroughAListIterator() {
        assertThat(Q04_24.withSeparators(List.of("a", "b", "c"))).containsExactly("A", "|", "B", "|", "C");
        assertThat(Q04_24.withSeparators(List.of())).isEmpty();
    }

    @Test
    @DisplayName("Q04.24 · set after add throws IllegalStateException until the next call to next or previous")
    void q04_24_setAfterAddIsIllegal() {
        ListIterator<String> it = new LinkedList<>(List.of("a", "b")).listIterator();
        it.next();
        it.add("x");

        assertThatThrownBy(() -> it.set("y")).isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("Q04.24 · a ListIterator started at size() walks the list backwards with previous")
    void q04_24_backwards() {
        assertThat(Q04_24.reversedCopy(List.of("a", "b", "c"))).containsExactly("c", "b", "a");
    }
}
