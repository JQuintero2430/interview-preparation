package dev.interview.javalanguage.m04.s04;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.util.ConcurrentModificationException;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.IdentityHashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NavigableMap;
import java.util.SortedMap;
import java.util.TreeMap;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class OrderedMapsTest {

    private static final int ACCESS_ORDER_CAPACITY = 3;

    // An access-ordered LinkedHashMap that removes its eldest entry once it holds more than maxEntries.
    private static final class Bounded<K, V> extends LinkedHashMap<K, V> {
        private final int maxEntries;

        Bounded(int maxEntries) {
            super(16, 0.75f, true);
            this.maxEntries = maxEntries;
        }

        @Override
        protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
            return size() > maxEntries;
        }
    }

    @Test
    @DisplayName("M04 §4 · insertion order is kept when an existing key is put again")
    void linkedHashMap_keepsInsertionOrder_onReinsertion() {
        Map<String, Integer> map = new LinkedHashMap<>();
        map.put("a", 1);
        map.put("b", 2);
        map.put("c", 3);
        map.put("a", 10);

        assertThat(map.keySet()).containsExactly("a", "b", "c");
        assertThat(map).containsEntry("a", 10);
    }

    @Test
    @DisplayName("M04 §4 · removeEldestEntry evicts the least recently accessed entry")
    void accessOrder_evictsLeastRecentlyAccessed() {
        Map<String, Integer> map = new Bounded<>(ACCESS_ORDER_CAPACITY);
        map.put("a", 1);
        map.put("b", 2);
        map.put("c", 3);
        map.get("a");
        map.put("d", 4);

        assertThat(map.keySet()).containsExactly("c", "a", "d");
    }

    @Test
    @DisplayName("M04 §4 · in an access-ordered map, get during iteration is a structural modification")
    void accessOrder_getDuringIteration_throwsConcurrentModification() {
        Map<String, Integer> map = new LinkedHashMap<>(16, 0.75f, true);
        map.put("a", 1);
        map.put("b", 2);
        map.put("c", 3);

        assertThatThrownBy(() -> {
                    for (String key : map.keySet()) {
                        map.get(key);
                    }
                })
                .isInstanceOf(ConcurrentModificationException.class);
    }

    @Test
    @DisplayName("M04 §4 · floorKey, ceilingKey and descendingMap navigate by key order")
    void treeMap_navigatesByKeyOrder() {
        NavigableMap<Integer, String> map = new TreeMap<>(Map.of(10, "ten", 20, "twenty", 30, "thirty"));

        assertThat(map.floorKey(25)).isEqualTo(20);
        assertThat(map.ceilingKey(25)).isEqualTo(30);
        assertThat(map.floorKey(5)).isNull();
        assertThat(map.descendingMap().keySet()).containsExactly(30, 20, 10);
    }

    @Test
    @DisplayName("M04 §4 · headMap is a live view")
    void headMap_isLiveView_andRejectsKeysOutsideItsRange() {
        TreeMap<Integer, String> map = new TreeMap<>(Map.of(10, "ten", 20, "twenty", 30, "thirty"));
        SortedMap<Integer, String> below25 = map.headMap(25);

        map.put(15, "fifteen");
        below25.remove(10);

        assertThat(below25.keySet()).containsExactly(15, 20);
        assertThat(map.keySet()).containsExactly(15, 20, 30);
        assertThatThrownBy(() -> below25.put(40, "forty")).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("M04 §4 · TreeMap rejects a null key under natural ordering")
    void treeMap_rejectsNullKey_underNaturalOrdering() {
        Map<String, Integer> map = new TreeMap<>();

        assertThatThrownBy(() -> map.put(null, 1)).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("M04 §4 · TreeMap compares keys with compareTo, HashMap with equals")
    void treeMap_usesCompareTo_whereHashMapUsesEquals() {
        Map<BigDecimal, String> tree = new TreeMap<>();
        Map<BigDecimal, String> hash = new HashMap<>();
        for (Map<BigDecimal, String> map : List.of(tree, hash)) {
            map.put(new BigDecimal("10"), "first");
            map.put(new BigDecimal("10.0"), "second");
        }

        assertThat(tree).hasSize(1).containsValue("second");
        assertThat(hash).hasSize(2);
    }

    @Test
    @DisplayName("M04 §4 · EnumMap iterates in ordinal order")
    void enumMap_iteratesInOrdinalOrder_andRejectsNullKey() {
        Map<DayOfWeek, String> map = new EnumMap<>(DayOfWeek.class);
        map.put(DayOfWeek.FRIDAY, "release");
        map.put(DayOfWeek.MONDAY, "plan");
        map.put(DayOfWeek.WEDNESDAY, "review");

        assertThat(map.keySet()).containsExactly(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY);
        assertThatThrownBy(() -> map.put(null, "never")).isInstanceOf(NullPointerException.class);
        assertThat(map.containsKey(null)).isFalse();
    }

    @Test
    @DisplayName("M04 §4 · IdentityHashMap keeps two equal but distinct String keys")
    void identityHashMap_comparesKeysWithReferenceEquality() {
        String first = new String("order-42");
        String second = new String("order-42");
        Map<String, Integer> identity = new IdentityHashMap<>();
        identity.put(first, 1);
        identity.put(second, 2);

        assertThat(first).isEqualTo(second);
        assertThat(identity).hasSize(2);
        assertThat(identity.get(first)).isEqualTo(1);
        assertThat(identity.get("order-42")).isNull();
    }
}
