package dev.interview.javalanguage.m04.ex1;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

/**
 * Module 04 Ex04.1: a bounded least-recently-used cache. It composes an access-order {@link LinkedHashMap}, so
 * {@code get} and {@code put} are constant time and no other {@code Map} method reaches callers.
 *
 * <p>Not thread-safe: even {@code get} reorders the entries. Confine it to one thread, or see module 12 for shared
 * caches.
 */
public final class LruCache<K, V> {

    private final AccessOrderMap<K, V> entries;

    public LruCache(int capacity, EvictionListener<K, V> listener) {
        if (capacity < 1) {
            throw new IllegalArgumentException("capacity must be at least 1: " + capacity);
        }
        this.entries = new AccessOrderMap<>(capacity, Objects.requireNonNull(listener, "listener"));
    }

    /** The value for {@code key}, which then becomes the most recently used; empty if absent. */
    public Optional<V> get(K key) {
        return Optional.ofNullable(entries.get(key));
    }

    /** Stores the value as the most recently used, evicting the least recently used entry if the cache is full. */
    public void put(K key, V value) {
        entries.put(Objects.requireNonNull(key, "key"), Objects.requireNonNull(value, "value"));
    }

    public int size() {
        return entries.size();
    }

    /** The keys from least to most recently used, as an unmodifiable snapshot. Reading it changes no order. */
    public List<K> keys() {
        return List.copyOf(entries.keySet());
    }

    // The policy lives in removeEldestEntry, which LinkedHashMap calls after each insertion of a new key.
    private static final class AccessOrderMap<K, V> extends LinkedHashMap<K, V> {

        private final int capacity;
        private final EvictionListener<K, V> listener;

        AccessOrderMap(int capacity, EvictionListener<K, V> listener) {
            super(16, 0.75f, true);
            this.capacity = capacity;
            this.listener = listener;
        }

        @Override
        protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
            if (size() <= capacity) {
                return false;
            }
            listener.onEviction(eldest.getKey(), eldest.getValue());
            return true;
        }
    }
}
