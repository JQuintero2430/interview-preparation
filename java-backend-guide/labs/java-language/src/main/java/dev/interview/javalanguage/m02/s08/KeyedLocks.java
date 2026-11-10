package dev.interview.javalanguage.m02.s08;

import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

// One lock per distinct key, kept forever; use lock striping or eviction when the key space is unbounded.
public final class KeyedLocks<K> {

    private static final String KEY_NAME = "key";

    private final ConcurrentMap<K, Object> locks = new ConcurrentHashMap<>();

    public Object lockFor(K key) {
        Objects.requireNonNull(key, KEY_NAME);
        return locks.computeIfAbsent(key, k -> new Object());
    }
}
