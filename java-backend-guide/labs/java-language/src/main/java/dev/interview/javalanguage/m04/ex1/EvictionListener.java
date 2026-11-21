package dev.interview.javalanguage.m04.ex1;

// Module 04 Ex04.1: told about each entry the cache evicts to stay within its capacity.
@FunctionalInterface
public interface EvictionListener<K, V> {

    /** Called once per evicted entry, before {@code put} returns. Must not call back into the cache. */
    void onEviction(K key, V value);
}
