package dev.interview.javalanguage.m04.s06;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Comparator;
import java.util.Deque;
import java.util.LinkedList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.PriorityQueue;
import java.util.Queue;
import java.util.Random;
import java.util.Stack;
import java.util.concurrent.ArrayBlockingQueue;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class QueuesTest {

    @Test
    @DisplayName("M04 §6 · offer and poll return special values where add and remove throw")
    void queueMethodPairs_throwOrReturnSpecialValue() {
        Queue<String> empty = new ArrayDeque<>();

        assertThatThrownBy(empty::remove).isInstanceOf(NoSuchElementException.class);
        assertThatThrownBy(empty::element).isInstanceOf(NoSuchElementException.class);
        assertThat(empty.poll()).isNull();
        assertThat(empty.peek()).isNull();

        // A capacity-restricted queue is the case offer was designed for; blocking queues themselves belong to 12.
        Queue<String> bounded = new ArrayBlockingQueue<>(1);
        assertThat(bounded.offer("a")).isTrue();
        assertThat(bounded.offer("b")).isFalse();
        assertThatThrownBy(() -> bounded.add("b")).isInstanceOf(IllegalStateException.class);
        assertThat(bounded).containsExactly("a");
    }

    @Test
    @DisplayName("M04 §6 · ArrayDeque rejects null")
    void arrayDeque_rejectsNull() {
        Deque<String> deque = new ArrayDeque<>();

        assertThatThrownBy(() -> deque.add(null)).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> deque.offer(null)).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> deque.addFirst(null)).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> deque.push(null)).isInstanceOf(NullPointerException.class);
        assertThat(deque).isEmpty();
    }

    @Test
    @DisplayName("M04 §6 · a LinkedList queue accepts null, so poll returning null no longer means empty")
    void linkedList_acceptsNull_makingPollAmbiguous() {
        Queue<String> queue = new LinkedList<>();
        queue.offer(null);

        assertThat(queue).hasSize(1);
        assertThat(queue.poll()).isNull();
        assertThat(queue).isEmpty();
        assertThat(queue.poll()).isNull();
    }

    @Test
    @DisplayName("M04 §6 · ArrayDeque push and pop behave as a LIFO stack")
    void arrayDeque_asStack_isLifo() {
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(1);
        stack.push(2);
        stack.push(3);

        assertThat(stack.peek()).isEqualTo(3);
        assertThat(stack).containsExactly(3, 2, 1);
        assertThat(stack.pop()).isEqualTo(3);
        assertThat(stack.pop()).isEqualTo(2);
        assertThat(stack.pop()).isEqualTo(1);
        assertThatThrownBy(stack::pop).isInstanceOf(NoSuchElementException.class);
    }

    @Test
    @DisplayName("M04 §6 · ArrayDeque offer and poll behave as a FIFO queue")
    void arrayDeque_asQueue_isFifo() {
        Queue<Integer> queue = new ArrayDeque<>();
        queue.offer(1);
        queue.offer(2);
        queue.offer(3);

        assertThat(queue.poll()).isEqualTo(1);
        assertThat(queue.poll()).isEqualTo(2);
        assertThat(queue.poll()).isEqualTo(3);
        assertThat(queue.poll()).isNull();
    }

    @Test
    @DisplayName("M04 §6 · Stack iterates bottom first, an ArrayDeque stack iterates top first")
    void stackAndArrayDeque_iterateInOppositeOrders() {
        Stack<Integer> legacy = new Stack<>();
        Deque<Integer> deque = new ArrayDeque<>();
        for (int i = 1; i <= 3; i++) {
            legacy.push(i);
            deque.push(i);
        }

        assertThat(legacy.peek()).isEqualTo(deque.peek()).isEqualTo(3);
        assertThat(legacy).containsExactly(1, 2, 3);
        assertThat(deque).containsExactly(3, 2, 1);
    }

    @Test
    @DisplayName("M04 §6 · a PriorityQueue's iterator order differs from its poll order")
    void priorityQueue_iterationIsHeapOrder_notPriorityOrder() {
        // siftUp places each offer: 7 -> [7]; 3 beats parent 7 -> [3, 7]; 9 stays under 3 -> [3, 7, 9];
        // 1 (index 3) beats parent 7 (index 1), then parent 3 (index 0) -> [1, 3, 9, 7];
        // 5 (index 4) does not beat parent 3 (index 1) -> [1, 3, 9, 7, 5].
        PriorityQueue<Integer> queue = new PriorityQueue<>();
        List.of(7, 3, 9, 1, 5).forEach(queue::offer);

        assertThat(queue.toString()).isEqualTo("[1, 3, 9, 7, 5]");
        assertThat(queue).containsExactly(1, 3, 9, 7, 5);
        assertThat(queue.peek()).isEqualTo(1);
        assertThat(drain(queue)).containsExactly(1, 3, 5, 7, 9);
    }

    @Test
    @DisplayName("M04 §6 · every parent is at most its children, after offers, polls and remove(Object)")
    void priorityQueue_keepsHeapInvariant() {
        Random random = new Random(42);
        PriorityQueue<Integer> queue = new PriorityQueue<>();
        for (int i = 0; i < 200; i++) {
            queue.offer(random.nextInt(1_000));
        }
        assertHeapInvariant(queue);

        for (int i = 0; i < 50; i++) {
            queue.poll();
        }
        assertHeapInvariant(queue);

        Integer interior = (Integer) queue.toArray()[queue.size() / 2];
        assertThat(queue.remove(interior)).isTrue();
        assertHeapInvariant(queue);
    }

    @Test
    @DisplayName("M04 §6 · a reversed comparator turns the min-heap into a max-heap")
    void priorityQueue_withReversedComparator_isMaxHeap() {
        PriorityQueue<Integer> queue = new PriorityQueue<>(Comparator.reverseOrder());
        List.of(7, 3, 9, 1, 5).forEach(queue::offer);

        assertThat(drain(queue)).containsExactly(9, 7, 5, 3, 1);
    }

    @Test
    @DisplayName("M04 §6 · PriorityQueue rejects null and, under natural ordering, a non-comparable element")
    void priorityQueue_rejectsNullAndNonComparable() {
        PriorityQueue<Object> queue = new PriorityQueue<>();

        assertThatThrownBy(() -> queue.offer(null)).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> queue.offer(new Object())).isInstanceOf(ClassCastException.class);
        assertThat(queue).isEmpty();
    }

    @Test
    @DisplayName("M04 §6 · a bare PriorityQueue does not keep submission order among equal priorities")
    void priorityQueue_breaksTiesWithoutRegardForInsertionOrder() {
        // The Javadoc only says ties are broken arbitrarily. In JDK 25, after a is polled the last slot (c) is moved
        // to the root and siftDown keeps it there, because c does not compare greater than b.
        Task a = new Task("a", 2);
        Task b = new Task("b", 2);
        Task c = new Task("c", 2);
        PriorityQueue<Task> queue = new PriorityQueue<>(Comparator.comparingInt(Task::priority));
        List.of(a, b, c).forEach(queue::offer);

        assertThat(drain(queue)).containsExactly(a, c, b);
    }

    @Test
    @DisplayName("M04 §6 · changing an element's priority while it is queued breaks the poll order")
    void priorityQueue_mutatedPriority_isNotResifted() {
        Task a = new Task("a", 1);
        Task b = new Task("b", 2);
        Task c = new Task("c", 3);
        PriorityQueue<Task> queue = new PriorityQueue<>(Comparator.comparingInt(Task::priority));
        List.of(a, b, c).forEach(queue::offer);

        a.priority = 10; // the heap is not told: a stays at the root

        assertThat(queue.poll()).isSameAs(a);
        assertThat(queue.poll()).isSameAs(b);
        assertThat(queue.poll()).isSameAs(c);
    }

    @Test
    @DisplayName("M04 §6 · removing, changing and re-offering an element restores the poll order")
    void priorityQueue_removeChangeReoffer_restoresOrder() {
        Task a = new Task("a", 1);
        Task b = new Task("b", 2);
        Task c = new Task("c", 3);
        PriorityQueue<Task> queue = new PriorityQueue<>(Comparator.comparingInt(Task::priority));
        List.of(a, b, c).forEach(queue::offer);

        assertThat(queue.remove(a)).isTrue();
        a.priority = 10;
        queue.offer(a);

        assertThat(queue.poll()).isSameAs(b);
        assertThat(queue.poll()).isSameAs(c);
        assertThat(queue.poll()).isSameAs(a);
    }

    @Test
    @DisplayName("M04 §6 · deques compare by identity, while a LinkedList compares as a List")
    void deques_inheritIdentityEquals() {
        Deque<Integer> first = new ArrayDeque<>(List.of(1, 2));
        Deque<Integer> second = new ArrayDeque<>(List.of(1, 2));

        assertThat(first).isNotEqualTo(second);
        assertThat(new LinkedList<>(List.of(1, 2))).isEqualTo(new LinkedList<>(List.of(1, 2)));
    }

    private static <T> List<T> drain(Queue<T> queue) {
        List<T> polled = new java.util.ArrayList<>();
        for (T next = queue.poll(); next != null; next = queue.poll()) {
            polled.add(next);
        }
        return polled;
    }

    // toArray() returns the heap array in index order: the children of index i are 2i + 1 and 2i + 2.
    private static void assertHeapInvariant(PriorityQueue<Integer> queue) {
        Integer[] heap = queue.toArray(new Integer[0]);
        for (int child = 1; child < heap.length; child++) {
            int parent = (child - 1) / 2;
            assertThat(heap[parent])
                    .as("parent %d of child %d in %s", parent, child, Arrays.toString(heap))
                    .isLessThanOrEqualTo(heap[child]);
        }
    }

    /** A queued element with a mutable priority, the anti-pattern this test demonstrates. */
    private static final class Task {
        private final String name;
        private int priority;

        Task(String name, int priority) {
            this.name = name;
            this.priority = priority;
        }

        int priority() {
            return priority;
        }

        @Override
        public String toString() {
            return name + "(" + priority + ")";
        }
    }
}
