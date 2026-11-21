package dev.interview.javalanguage.m04.s06;

import java.util.Objects;

/**
 * A unit of work for {@link JobQueue}. A lower {@code priority} number is more urgent. The record is immutable, so a
 * job's priority cannot change while it sits in the heap.
 */
public record Job(String id, int priority) {

    public Job {
        Objects.requireNonNull(id, "id");
    }
}
