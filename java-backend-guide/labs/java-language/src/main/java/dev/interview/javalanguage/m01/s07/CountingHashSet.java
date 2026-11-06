package dev.interview.javalanguage.m01.s07;

import java.util.Collection;
import java.util.HashSet;

// Module 01 §7: the broken version. The inherited addAll calls add back on this class, so each element counts twice.
public class CountingHashSet<E> extends HashSet<E> {

    private int addCount;

    @Override
    public boolean add(E element) {
        addCount++;
        return super.add(element);
    }

    @Override
    public boolean addAll(Collection<? extends E> elements) {
        addCount += elements.size();
        return super.addAll(elements);
    }

    public int addCount() {
        return addCount;
    }
}
