package dev.interview.javalanguage.m01.s11;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

// Module 01 §11: the bus plays the long-lived registry. Any listener it holds stays strongly reachable, so an inner
// listener keeps its whole creating screen alive; listeners() returns a read-only view so callers cannot reorder it.
public final class EventBus {

    private final List<Runnable> listeners = new ArrayList<>();

    public void register(Runnable listener) {
        listeners.add(listener);
    }

    public List<Runnable> listeners() {
        return Collections.unmodifiableList(listeners);
    }

    public void fire() {
        listeners.forEach(Runnable::run);
    }
}
