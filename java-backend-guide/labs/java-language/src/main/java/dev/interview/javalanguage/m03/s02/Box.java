package dev.interview.javalanguage.m03.s02;

import java.util.function.Function;

// Module 03 §2: a generic class. T is chosen once per instance; map adds a method-level R chosen at each call.
public final class Box<T> {

    private final T value;

    public Box(T value) {
        this.value = value;
    }

    public T value() {
        return value;
    }

    public <R> Box<R> map(Function<T, R> mapper) {
        return new Box<>(mapper.apply(value));
    }
}
