package dev.interview.javalanguage.m04.s01;

import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.SequencedCollection;
import java.util.SequencedMap;

// Module 04 §1: one signature for "the newest element", whatever ordered collection holds it.
public final class SequencedViews {

    private SequencedViews() {}

    // A List, a Deque, a LinkedHashSet and a TreeSet all answer getLast() since Java 21.
    public static <E> E newest(SequencedCollection<E> items) {
        return items.getLast();
    }

    // reversed() is a view: the stream reads the backing collection from its end.
    public static <E> List<E> newestFirst(SequencedCollection<E> items, int limit) {
        return items.reversed().stream().limit(limit).toList();
    }

    // putLast relocates an existing key; a TreeMap orders by key and throws instead.
    public static <K, V> void touch(SequencedMap<K, V> recent, K key, V value) {
        recent.putLast(key, value);
    }

    // Before Java 21 a LinkedHashSet exposed its last element only through a full walk.
    public static <E> E newestBeforeJava21(LinkedHashSet<E> items) {
        Iterator<E> iterator = items.iterator();
        E last = iterator.next();
        while (iterator.hasNext()) {
            last = iterator.next();
        }
        return last;
    }
}
