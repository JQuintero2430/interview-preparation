package dev.interview.javalanguage.m06.outputs;

import java.io.Serial;

// Module 06 Q06.11: a preallocated exception shared by every throw, with and without suppression.
public final class Q06_11 {

    private Q06_11() {}

    // Shared instance built with suppression and the writable stack trace enabled, as the two-argument constructor
    // does.
    public static final QueueFullException SHARED = new QueueFullException("queue full", true);

    // Shared instance built with suppression and the writable stack trace both disabled.
    public static final QueueFullException SHARED_FROZEN = new QueueFullException("queue full", false);

    public static final class QueueFullException extends RuntimeException {
        @Serial
        private static final long serialVersionUID = 1L;

        QueueFullException(String message, boolean mutable) {
            super(message, null, mutable, mutable);
        }
    }

    public interface Slot extends AutoCloseable {
        @Override
        void close();
    }

    // One rejected request: the shared exception is thrown while a slot is held, and releasing the slot fails.
    public static void reject(QueueFullException shared, Slot slot) {
        try (slot) {
            throw shared;
        }
    }
}
