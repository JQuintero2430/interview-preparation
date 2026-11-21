package dev.interview.javalanguage.m04.s06;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.PriorityQueue;

/**
 * Dispatches jobs most urgent first, and jobs of equal priority in submission order. A {@code PriorityQueue} breaks
 * ties arbitrarily, so each job is wrapped with a sequence number that the comparator uses as the second key. Not
 * thread-safe: concurrent dispatchers need {@code PriorityBlockingQueue} (module 12).
 */
public final class JobQueue {

    private record Entry(Job job, long sequence) {}

    private static final Comparator<Entry> DISPATCH_ORDER =
            Comparator.comparingInt((Entry entry) -> entry.job().priority()).thenComparingLong(Entry::sequence);

    private final PriorityQueue<Entry> heap = new PriorityQueue<>(DISPATCH_ORDER);
    private long nextSequence;

    public void submit(Job job) {
        Objects.requireNonNull(job, "job");
        heap.offer(new Entry(job, nextSequence++));
    }

    public Optional<Job> next() {
        return Optional.ofNullable(heap.poll()).map(Entry::job);
    }

    // The heap's own iteration order is not dispatch order, so sort a snapshot instead of returning it as is.
    public List<Job> pending() {
        return heap.stream().sorted(DISPATCH_ORDER).map(Entry::job).toList();
    }

    public int size() {
        return heap.size();
    }
}
