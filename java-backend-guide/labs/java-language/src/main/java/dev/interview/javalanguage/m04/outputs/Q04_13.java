package dev.interview.javalanguage.m04.outputs;

import dev.interview.javalanguage.m04.s03.TableProbe;
import java.util.HashMap;

// Module 04 Q04.13: how many times a map filled one put at a time resizes, and how many nodes the
// resizes relink. Reads the private table, so it runs in a child JVM (Q04TableProbeTest).
public final class Q04_13 {

    private static final int MAPPINGS = 100_000;

    private Q04_13() {}

    public static void main(String[] args) {
        System.out.println("new HashMap<>(): " + fill(new HashMap<>()));
        System.out.println("HashMap.newHashMap(" + MAPPINGS + "): " + fill(HashMap.newHashMap(MAPPINGS)));
    }

    // A resize relinks every node already in the map, so each one moves size() nodes.
    static String fill(HashMap<Integer, Integer> map) {
        map.put(0, 0);
        int capacity = TableProbe.capacity(map);
        int resizes = 0;
        long moved = 0;
        for (int key = 1; key < MAPPINGS; key++) {
            map.put(key, key);
            if (TableProbe.capacity(map) != capacity) {
                capacity = TableProbe.capacity(map);
                resizes++;
                moved += map.size();
            }
        }
        return resizes + " resizes, " + moved + " nodes moved, final table " + capacity;
    }
}
