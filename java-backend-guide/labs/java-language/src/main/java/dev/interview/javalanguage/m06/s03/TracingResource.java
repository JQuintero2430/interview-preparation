package dev.interview.javalanguage.m06.s03;

import java.util.List;

// A resource that records when it opens and closes, and can be told to fail at either step.
public final class TracingResource implements AutoCloseable {

    public enum Failure {
        NONE,
        ON_OPEN,
        ON_CLOSE
    }

    private final String name;
    private final List<String> events;
    private final Failure failure;

    private TracingResource(String name, List<String> events, Failure failure) {
        this.name = name;
        this.events = events;
        this.failure = failure;
    }

    public static TracingResource open(String name, List<String> events) {
        return open(name, events, Failure.NONE);
    }

    public static TracingResource open(String name, List<String> events, Failure failure) {
        if (failure == Failure.ON_OPEN) {
            events.add("open " + name + " failed");
            throw new IllegalStateException("open " + name + " failed");
        }
        events.add("open " + name);
        return new TracingResource(name, events, failure);
    }

    @Override
    public void close() {
        events.add("close " + name);
        if (failure == Failure.ON_CLOSE) {
            throw new IllegalStateException("close " + name + " failed");
        }
    }
}
