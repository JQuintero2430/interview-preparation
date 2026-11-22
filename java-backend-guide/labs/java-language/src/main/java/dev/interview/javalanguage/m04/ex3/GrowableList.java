package dev.interview.javalanguage.m04.ex3;

import java.util.ConcurrentModificationException;
import java.util.Iterator;
import java.util.NoSuchElementException;
import java.util.Objects;

/**
 * Module 04 Ex04.3: a growable array list whose iterator is fail-fast, built the way {@link java.util.ArrayList} builds
 * its own: a backing {@code Object[]} that grows by half, a {@code modCount} incremented by every structural change,
 * and an iterator that compares it with the value it expects.
 *
 * <p>Not thread-safe. The fail-fast check detects bugs on one thread; across threads it is best effort only.
 */
public final class GrowableList<E> implements Iterable<E> {

    static final int DEFAULT_CAPACITY = 10;

    private Object[] elements;
    private int size;
    private int modCount;

    public GrowableList() {
        this(DEFAULT_CAPACITY);
    }

    public GrowableList(int initialCapacity) {
        if (initialCapacity < 0) {
            throw new IllegalArgumentException("initial capacity must not be negative: " + initialCapacity);
        }
        this.elements = new Object[initialCapacity];
    }

    /** Appends {@code element}, growing the backing array by half when it is full. A structural change. */
    public void add(E element) {
        if (size == elements.length) {
            grow();
        }
        elements[size++] = element;
        modCount++;
    }

    public E get(int index) {
        return elementAt(Objects.checkIndex(index, size));
    }

    /** Replaces the element at {@code index} and returns the old one. Not a structural change. */
    public E set(int index, E element) {
        E old = elementAt(Objects.checkIndex(index, size));
        elements[index] = element;
        return old;
    }

    /** Removes the element at {@code index}, shifting the tail left by one. A structural change. */
    public E remove(int index) {
        E old = elementAt(Objects.checkIndex(index, size));
        int tail = size - index - 1;
        System.arraycopy(elements, index + 1, elements, index, tail);
        elements[--size] = null;
        modCount++;
        return old;
    }

    public int size() {
        return size;
    }

    /** The length of the backing array. */
    public int capacity() {
        return elements.length;
    }

    @Override
    public Iterator<E> iterator() {
        return new FailFastIterator();
    }

    // As ArraysSupport.newLength does for ArrayList: grow by half, but by at least one slot.
    private void grow() {
        int oldCapacity = elements.length;
        Object[] grown = new Object[oldCapacity + Math.max(1, oldCapacity >> 1)];
        System.arraycopy(elements, 0, grown, 0, size);
        elements = grown;
    }

    @SuppressWarnings("unchecked")
    private E elementAt(int index) {
        return (E) elements[index];
    }

    // An inner class, so it reads the list's size, elements and modCount directly, as ArrayList.Itr does.
    private final class FailFastIterator implements Iterator<E> {

        private int cursor;
        private int lastReturned = -1;
        private int expectedModCount = modCount;

        @Override
        public boolean hasNext() {
            return cursor != size;
        }

        @Override
        public E next() {
            checkForComodification();
            if (cursor >= size) {
                throw new NoSuchElementException();
            }
            lastReturned = cursor++;
            return elementAt(lastReturned);
        }

        @Override
        public void remove() {
            if (lastReturned < 0) {
                throw new IllegalStateException("remove() needs a next() since the last remove()");
            }
            checkForComodification();
            GrowableList.this.remove(lastReturned);
            cursor = lastReturned;
            lastReturned = -1;
            expectedModCount = modCount;
        }

        private void checkForComodification() {
            if (modCount != expectedModCount) {
                throw new ConcurrentModificationException();
            }
        }
    }
}
