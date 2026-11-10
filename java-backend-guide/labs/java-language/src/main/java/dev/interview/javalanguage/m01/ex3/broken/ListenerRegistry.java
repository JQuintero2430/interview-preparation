package dev.interview.javalanguage.m01.ex3.broken;

import java.util.Collection;
import java.util.HashSet;

/** Intentionally defective starting code for Ex01.3; do not copy. */
// Module 01 Ex01.3: inheriting from HashSet couples the counters to its internals, and the constructor calls a hook
// that a subclass can override before its own fields exist.
public class ListenerRegistry extends HashSet<Runnable> {

    int registrations;

    public ListenerRegistry() {
        // Defect: overridable call from the constructor, so a subclass hook runs before its fields are assigned.
        onCreated();
    }

    protected void onCreated() {}

    @Override
    public boolean add(Runnable listener) {
        registrations++;
        return super.add(listener);
    }

    @Override
    public boolean addAll(Collection<? extends Runnable> listeners) {
        // Defect: HashSet.addAll calls add, so each element counts twice.
        registrations += listeners.size();
        return super.addAll(listeners);
    }

    public int registrations() {
        return registrations;
    }

    public void fire() {
        for (Runnable listener : this) {
            listener.run();
        }
    }
}
