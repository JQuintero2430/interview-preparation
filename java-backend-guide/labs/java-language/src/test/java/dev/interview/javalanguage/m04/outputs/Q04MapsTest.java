package dev.interview.javalanguage.m04.outputs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ConcurrentModificationException;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.NavigableMap;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Claims of Q04.12 and Q04.16 that are not Output questions but are stated as lab results.
class Q04MapsTest {

    @Test
    @DisplayName("Q04.12 · a Hashtable key iterator throws ConcurrentModificationException after a put")
    void q04_12_hashtableIteratorIsFailFast() {
        Map<String, Integer> table = new Hashtable<>(Map.of("a", 1, "b", 2));
        Iterator<String> keys = table.keySet().iterator();
        keys.next();
        table.put("c", 3);

        assertThatThrownBy(keys::next).isInstanceOf(ConcurrentModificationException.class);
    }

    @Test
    @DisplayName("Q04.12 · a ConcurrentHashMap key iterator keeps going after a put")
    void q04_12_concurrentHashMapIteratorIsWeaklyConsistent() {
        Map<String, Integer> map = new ConcurrentHashMap<>(Map.of("a", 1, "b", 2));
        int seen = 0;
        for (Iterator<String> keys = map.keySet().iterator(); keys.hasNext(); keys.next()) {
            map.putIfAbsent("c", 3);
            seen++;
        }

        assertThat(seen).isBetween(2, 3);
        assertThat(map).containsOnlyKeys("a", "b", "c");
    }

    @Test
    @DisplayName("Q04.16 · headMap excludes its bound, tailMap includes it, and the boolean overloads change that")
    void q04_16_viewBounds() {
        NavigableMap<Integer, String> map = new TreeMap<>(Map.of(10, "ten", 20, "twenty", 30, "thirty"));

        assertThat(map.headMap(20).keySet()).containsExactly(10);
        assertThat(map.headMap(20, true).keySet()).containsExactly(10, 20);
        assertThat(map.tailMap(20).keySet()).containsExactly(20, 30);
        assertThat(map.tailMap(20, false).keySet()).containsExactly(30);
        assertThat(map.subMap(10, 30).keySet()).containsExactly(10, 20);
    }

    @Test
    @DisplayName("Q04.16 · floorKey and ceilingKey can return the key itself, lowerKey and higherKey never do")
    void q04_16_neighbours() {
        NavigableMap<Integer, String> map = new TreeMap<>(Map.of(10, "ten", 20, "twenty", 30, "thirty"));

        assertThat(List.of(map.floorKey(20), map.ceilingKey(20), map.lowerKey(20), map.higherKey(20)))
                .containsExactly(20, 20, 10, 30);
        assertThat(map.higherKey(30)).isNull();
        assertThat(map.firstKey()).isEqualTo(10);
    }
}
