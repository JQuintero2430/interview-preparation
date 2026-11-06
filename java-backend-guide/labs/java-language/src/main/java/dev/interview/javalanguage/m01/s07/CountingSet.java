package dev.interview.javalanguage.m01.s07;

import java.util.AbstractSet;
import java.util.Collection;
import java.util.Iterator;
import java.util.Set;

// Module 01 §7: composition with forwarding. The delegate's own add calls never reach this wrapper.
public final class CountingSet<E> extends AbstractSet<E> {

    private final Set<E> delegate;
    private int addCount;

    public CountingSet(Set<E> delegate) {
        this.delegate = delegate;
    }

    @Override
    public boolean add(E element) {
        addCount++;
        return delegate.add(element);
    }

    @Override
    public boolean addAll(Collection<? extends E> elements) {
        addCount += elements.size();
        return delegate.addAll(elements);
    }

    @Override
    public boolean contains(Object element) {
        return delegate.contains(element);
    }

    @Override
    public Iterator<E> iterator() {
        return delegate.iterator();
    }

    @Override
    public int size() {
        return delegate.size();
    }

    public int addCount() {
        return addCount;
    }
}
