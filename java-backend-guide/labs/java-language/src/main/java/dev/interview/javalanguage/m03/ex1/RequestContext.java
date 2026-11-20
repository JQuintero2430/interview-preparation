package dev.interview.javalanguage.m03.ex1;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

// Module 03 Ex03.1: a type-safe heterogeneous container. The key is the value's Class, so put and get agree on T,
// and Class.cast checks each value where it enters, not where some later caller reads it.
public final class RequestContext {

    private static final String TYPE = "type";

    private final Map<Class<?>, Object> values = new HashMap<>();

    public <T> void put(Class<T> type, T value) {
        Objects.requireNonNull(type, TYPE);
        values.put(type, type.cast(value));
    }

    public <T> T get(Class<T> type) {
        Objects.requireNonNull(type, TYPE);
        return type.cast(values.get(type));
    }
}
