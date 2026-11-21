package dev.interview.javalanguage.m04.outputs;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

// Module 04 Q04.15: which entry a bounded LinkedHashMap evicts depends on its order mode and on which
// calls count as an access.
public final class Q04_15 {

    private static final int MAX_ENTRIES = 2;

    private Q04_15() {}

    public static void main(String[] args) {
        System.out.println(putTouchPut(new Bounded<>(MAX_ENTRIES, true), cache -> cache.get("a")));
        System.out.println(putTouchPut(new Bounded<>(MAX_ENTRIES, true), cache -> cache.containsKey("a")));
        System.out.println(putTouchPut(new Bounded<>(MAX_ENTRIES, false), cache -> cache.get("a")));
    }

    // Puts a and b, touches the map, then puts c, which pushes the map over its bound.
    static Map<String, Integer> putTouchPut(Map<String, Integer> cache, Consumer<Map<String, Integer>> touch) {
        cache.put("a", 1);
        cache.put("b", 2);
        touch.accept(cache);
        cache.put("c", 3);
        return cache;
    }

    // The size() that removeEldestEntry observes on each of three puts into a map bounded at 2.
    static List<Integer> sizesSeenByRemoveEldestEntry() {
        Bounded<String, Integer> cache = new Bounded<>(MAX_ENTRIES, true);
        putTouchPut(cache, map -> {});
        return cache.sizesSeen;
    }

    // An LRU (accessOrder = true) or FIFO (false) map that drops its eldest entry once over maxEntries.
    static final class Bounded<K, V> extends LinkedHashMap<K, V> {
        private final int maxEntries;
        private final List<Integer> sizesSeen = new ArrayList<>();

        Bounded(int maxEntries, boolean accessOrder) {
            super(16, 0.75f, accessOrder);
            this.maxEntries = maxEntries;
        }

        @Override
        protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
            sizesSeen.add(size());
            return size() > maxEntries;
        }
    }
}
