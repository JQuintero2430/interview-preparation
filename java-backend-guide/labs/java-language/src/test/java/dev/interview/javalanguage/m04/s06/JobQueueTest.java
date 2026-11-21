package dev.interview.javalanguage.m04.s06;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class JobQueueTest {

    @Test
    @DisplayName("M04 §6 · jobs are dispatched most urgent first (lowest priority number)")
    void next_returnsMostUrgentFirst() {
        JobQueue queue = new JobQueue();
        queue.submit(new Job("report", 5));
        queue.submit(new Job("payment", 1));
        queue.submit(new Job("email", 3));

        assertThat(queue.next()).contains(new Job("payment", 1));
        assertThat(queue.next()).contains(new Job("email", 3));
        assertThat(queue.next()).contains(new Job("report", 5));
    }

    @Test
    @DisplayName("M04 §6 · jobs of equal priority are dispatched in submission order")
    void next_breaksTiesBySubmissionOrder() {
        JobQueue queue = new JobQueue();
        for (String id : new String[] {"a", "b", "c", "d", "e", "f"}) {
            queue.submit(new Job(id, 2));
        }
        queue.submit(new Job("urgent", 1));

        assertThat(queue.next()).map(Job::id).contains("urgent");
        for (String id : new String[] {"a", "b", "c", "d", "e", "f"}) {
            assertThat(queue.next()).map(Job::id).contains(id);
        }
    }

    @Test
    @DisplayName("M04 §6 · pending lists jobs in dispatch order without removing them")
    void pending_isDispatchOrder_andLeavesQueueIntact() {
        JobQueue queue = new JobQueue();
        queue.submit(new Job("c", 7));
        queue.submit(new Job("a", 3));
        queue.submit(new Job("d", 9));
        queue.submit(new Job("b", 1));
        queue.submit(new Job("e", 5));

        assertThat(queue.pending()).extracting(Job::id).containsExactly("b", "a", "e", "c", "d");
        assertThat(queue.size()).isEqualTo(5);
        assertThat(queue.next()).map(Job::id).contains("b");
    }

    @Test
    @DisplayName("M04 §6 · an empty queue returns no job instead of null")
    void next_onEmptyQueue_isEmptyOptional() {
        assertThat(new JobQueue().next()).isEmpty();
    }

    @Test
    @DisplayName("M04 §6 · a null job is rejected at submission")
    void submit_rejectsNull() {
        JobQueue queue = new JobQueue();

        assertThatThrownBy(() -> queue.submit(null)).isInstanceOf(NullPointerException.class);
        assertThat(queue.size()).isZero();
    }
}
