package dev.interview.javalanguage.m04.outputs;

import dev.interview.javalanguage.m04.s03.TableProbe;
import java.util.HashMap;

// Module 04 Q04.10: the int of new HashMap<>(n) is a capacity, the int of HashMap.newHashMap(n) an
// expected number of mappings. Reads the private table, so it runs in a child JVM (Q04TableProbeTest).
public final class Q04_10 {

    private Q04_10() {}

    public static void main(String[] args) {
        for (int n : new int[] {10, 13}) {
            System.out.println("new HashMap<>(" + n + "): " + growth(new HashMap<>(n)));
            System.out.println("HashMap.newHashMap(" + n + "): " + growth(HashMap.newHashMap(n)));
        }
    }

    // Puts keys 1, 2, 3, ... until the table doubles, and reports the table sizes it saw.
    static String growth(HashMap<Integer, Integer> map) {
        int before = TableProbe.capacity(map);
        map.put(1, 1);
        int allocated = TableProbe.capacity(map);
        int key = 1;
        while (TableProbe.capacity(map) == allocated) {
            key++;
            map.put(key, key);
        }
        return before + " buckets, " + allocated + " after put 1, " + TableProbe.capacity(map) + " on put " + key;
    }
}
