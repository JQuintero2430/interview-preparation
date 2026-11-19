package dev.interview.javalanguage.m03.s06;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.function.IntFunction;

// Module 03 §6: a fixed-capacity buffer over (T[]) new Object[n]. Safe while the array stays inside;
// snapshot() lets it escape on purpose, and snapshot(IntFunction) is the fix.
public final class SnapshotBuffer<T> {

    private final T[] items;
    private int size;

    @SuppressWarnings("unchecked") // T erases to Object, so this array is an Object[] at run time.
    public SnapshotBuffer(int capacity) {
        this.items = (T[]) new Object[capacity];
    }

    public void add(T item) {
        Objects.requireNonNull(item, "item");
        if (size == items.length) {
            throw new IllegalStateException("buffer is full");
        }
        items[size++] = item;
    }

    public int size() {
        return size;
    }

    public T get(int index) {
        Objects.checkIndex(index, size);
        return items[index];
    }

    // Defect on purpose: the copy is still an Object[], so a caller that assigns it to String[] fails.
    public T[] snapshot() {
        return Arrays.copyOf(items, size);
    }

    public T[] snapshot(IntFunction<T[]> generator) {
        return toList().toArray(generator);
    }

    public List<T> toList() {
        return List.of(Arrays.copyOf(items, size));
    }
}
