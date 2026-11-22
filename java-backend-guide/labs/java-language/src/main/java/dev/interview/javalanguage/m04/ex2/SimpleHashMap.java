package dev.interview.javalanguage.m04.ex2;

/**
 * Module 04 Ex04.2: a minimal separate-chaining hash map built the way {@link java.util.HashMap} builds its list bins:
 * a power-of-two table, the {@code h ^ (h >>> 16)} spread, the {@code (n - 1) & hash} index, a hash stored in each node,
 * and a doubling resize that splits every bin into a "lo" and a "hi" list.
 *
 * <p>No tree bins, no maximum capacity, no views and no iteration. Not thread-safe.
 */
public final class SimpleHashMap<K, V> {

    static final int DEFAULT_CAPACITY = 16;
    static final float LOAD_FACTOR = 0.75f;

    private Node<K, V>[] table = newTable(DEFAULT_CAPACITY);
    private int threshold = thresholdFor(DEFAULT_CAPACITY);
    private int size;

    /** The value mapped to {@code key}, or {@code null} if absent or mapped to {@code null}. */
    public V get(Object key) {
        Node<K, V> node = find(key);
        return node == null ? null : node.value;
    }

    public boolean containsKey(Object key) {
        return find(key) != null;
    }

    /** Maps {@code key} to {@code value} and returns the previous value, or {@code null} for a new key. */
    public V put(K key, V value) {
        int hash = spread(key);
        int index = indexFor(hash, table.length);
        Node<K, V> last = null;
        for (Node<K, V> node = table[index]; node != null; node = node.next) {
            if (node.matches(hash, key)) {
                return node.replace(value);
            }
            last = node;
        }
        Node<K, V> added = new Node<>(hash, key, value);
        if (last == null) {
            table[index] = added;
        } else {
            last.next = added;
        }
        if (++size > threshold) {
            resize();
        }
        return null;
    }

    /** Removes the mapping for {@code key} and returns its value, or {@code null} if there was none. */
    public V remove(Object key) {
        int hash = spread(key);
        int index = indexFor(hash, table.length);
        Node<K, V> previous = null;
        for (Node<K, V> node = table[index]; node != null; previous = node, node = node.next) {
            if (node.matches(hash, key)) {
                unlink(index, previous, node);
                size--;
                return node.value;
            }
        }
        return null;
    }

    public int size() {
        return size;
    }

    /** The current table length: always a power of two. */
    public int capacity() {
        return table.length;
    }

    /** The same spread as {@code HashMap.hash}: 0 for {@code null}, the upper 16 bits folded into the lower 16. */
    static int spread(Object key) {
        if (key == null) {
            return 0;
        }
        int h = key.hashCode();
        return h ^ (h >>> 16);
    }

    /** The bin for {@code hash} in a table of {@code length} slots, a power of two: the remainder without a division. */
    static int indexFor(int hash, int length) {
        return (length - 1) & hash;
    }

    /** How many nodes the bin at {@code index} holds (for the tests). */
    int nodesInBin(int index) {
        int count = 0;
        for (Node<K, V> node = table[index]; node != null; node = node.next) {
            count++;
        }
        return count;
    }

    private Node<K, V> find(Object key) {
        int hash = spread(key);
        for (Node<K, V> node = table[indexFor(hash, table.length)]; node != null; node = node.next) {
            if (node.matches(hash, key)) {
                return node;
            }
        }
        return null;
    }

    private void unlink(int index, Node<K, V> previous, Node<K, V> node) {
        if (previous == null) {
            table[index] = node.next;
        } else {
            previous.next = node.next;
        }
    }

    // Doubling adds one bit to the mask: a node in bin j stays at j or moves to j + oldCapacity, decided by
    // (hash & oldCapacity). The stored hash decides, so no key's hashCode is called again.
    private void resize() {
        Node<K, V>[] old = table;
        table = newTable(old.length << 1);
        threshold = thresholdFor(table.length);
        for (int j = 0; j < old.length; j++) {
            split(old[j], j, old.length);
        }
    }

    private void split(Node<K, V> head, int index, int oldCapacity) {
        Chain<K, V> lo = new Chain<>();
        Chain<K, V> hi = new Chain<>();
        Node<K, V> node = head;
        while (node != null) {
            Node<K, V> next = node.next;
            ((node.hash & oldCapacity) == 0 ? lo : hi).append(node);
            node = next;
        }
        table[index] = lo.head;
        table[index + oldCapacity] = hi.head;
    }

    private static int thresholdFor(int capacity) {
        return (int) (capacity * LOAD_FACTOR);
    }

    @SuppressWarnings("unchecked")
    private static <K, V> Node<K, V>[] newTable(int length) {
        return (Node<K, V>[]) new Node<?, ?>[length];
    }

    private static final class Node<K, V> {

        private final int hash;
        private final K key;
        private V value;
        private Node<K, V> next;

        Node(int hash, K key, V value) {
            this.hash = hash;
            this.key = key;
            this.value = value;
        }

        // The int comparison filters out almost every non-matching node before equals runs, as in HashMap.getNode.
        boolean matches(int hash, Object key) {
            return this.hash == hash && (this.key == key || (key != null && key.equals(this.key)));
        }

        V replace(V newValue) {
            V old = value;
            value = newValue;
            return old;
        }
    }

    // A list being rebuilt during a split, appended at the tail so each half keeps the bin's order.
    private static final class Chain<K, V> {

        private Node<K, V> head;
        private Node<K, V> tail;

        void append(Node<K, V> node) {
            node.next = null;
            if (tail == null) {
                head = node;
            } else {
                tail.next = node;
            }
            tail = node;
        }
    }
}
