package dev.interview.javalanguage.m04.s02;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.RandomAccess;

// Module 04 §2: one algorithm, two access strategies, chosen by the RandomAccess marker.
public final class ListAccess {

    private ListAccess() {}

    public static <E> List<E> everyNth(List<E> source, int step) {
        if (step < 1) {
            throw new IllegalArgumentException("step must be at least 1: " + step);
        }
        return source instanceof RandomAccess ? byIndex(source, step) : byIterator(source, step);
    }

    // get(i) is constant time on an ArrayList, so jumping by index skips the elements in between.
    private static <E> List<E> byIndex(List<E> source, int step) {
        List<E> picked = new ArrayList<>(source.size() / step + 1);
        for (int i = 0; i < source.size(); i += step) {
            picked.add(source.get(i));
        }
        return picked;
    }

    // On a LinkedList each get(i) walks from an end, so one pass with an iterator is linear instead.
    private static <E> List<E> byIterator(List<E> source, int step) {
        List<E> picked = new ArrayList<>();
        Iterator<E> iterator = source.iterator();
        for (int i = 0; iterator.hasNext(); i++) {
            E element = iterator.next();
            if (i % step == 0) {
                picked.add(element);
            }
        }
        return picked;
    }
}
