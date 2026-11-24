package dev.interview.javalanguage.m06.s02;

import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.atomic.AtomicInteger;

// The broken version: the slot is released only when the work returns normally.
public final class LeakyLimiter {

    private final AtomicInteger inFlight = new AtomicInteger();
    private final int limit;

    public LeakyLimiter(int limit) {
        this.limit = limit;
    }

    public <T, E extends Exception> T run(Work<T, E> work) throws E {
        if (inFlight.incrementAndGet() > limit) {
            inFlight.decrementAndGet();
            throw new RejectedExecutionException("limit " + limit + " reached");
        }
        T result = work.run();
        inFlight.decrementAndGet();
        return result;
    }

    public int inFlight() {
        return inFlight.get();
    }
}
