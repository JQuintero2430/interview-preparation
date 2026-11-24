package dev.interview.javalanguage.m06.s02;

import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.atomic.AtomicInteger;

// Admits at most `limit` calls at once; the slot is released in finally, so every exit path gives it back.
public final class InFlightLimiter {

    private final AtomicInteger inFlight = new AtomicInteger();
    private final int limit;

    public InFlightLimiter(int limit) {
        this.limit = limit;
    }

    public <T, E extends Exception> T run(Work<T, E> work) throws E {
        if (inFlight.incrementAndGet() > limit) {
            inFlight.decrementAndGet();
            throw new RejectedExecutionException("limit " + limit + " reached");
        }
        try {
            return work.run();
        } finally {
            inFlight.decrementAndGet();
        }
    }

    public int inFlight() {
        return inFlight.get();
    }
}
