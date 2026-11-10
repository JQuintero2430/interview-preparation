package dev.interview.javalanguage.m01.ex3;

import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;
import java.util.function.Consumer;

// Module 01 Ex01.3: composition instead of inheritance, one counting path, and a factory that hands the registry out
// only after it is fully built.
public final class ListenerRegistry {

    private final String name;
    private final Set<Runnable> listeners = new LinkedHashSet<>();
    private int registrations;

    private ListenerRegistry(String name) {
        this.name = Objects.requireNonNull(name);
    }

    // The callback runs after construction because a hook called from the constructor would see unassigned state.
    public static ListenerRegistry create(String name, Consumer<? super ListenerRegistry> onCreated) {
        Objects.requireNonNull(onCreated);
        ListenerRegistry registry = new ListenerRegistry(name);
        onCreated.accept(registry);
        return registry;
    }

    public boolean add(Runnable listener) {
        Objects.requireNonNull(listener);
        registrations++;
        return listeners.add(listener);
    }

    // Routing through add keeps a single place that counts, unlike the inherited addAll that counted twice.
    public boolean addAll(Collection<? extends Runnable> toAdd) {
        boolean changed = false;
        for (Runnable listener : toAdd) {
            changed |= add(listener);
        }
        return changed;
    }

    public int registrations() {
        return registrations;
    }

    public String name() {
        return name;
    }

    public Set<Runnable> listeners() {
        return Collections.unmodifiableSet(listeners);
    }

    public void fire() {
        for (Runnable listener : listeners) {
            listener.run();
        }
    }
}
