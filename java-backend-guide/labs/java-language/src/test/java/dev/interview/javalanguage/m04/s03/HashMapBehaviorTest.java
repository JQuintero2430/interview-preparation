package dev.interview.javalanguage.m04.s03;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.InaccessibleObjectException;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.IntStream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class HashMapBehaviorTest {

    private static final int COLLIDING_KEYS = 11;

    @Test
    @DisplayName("M04 §3 · a null key and null values are allowed")
    void hashMap_acceptsNullKeyAndNullValues() {
        Map<String, String> map = new HashMap<>();
        map.put(null, "stored under null");
        map.put("present", null);

        assertThat(map.get(null)).isEqualTo("stored under null");
        assertThat(map.get("present")).isNull();
        assertThat(map.containsKey("present")).isTrue();
        assertThat(map.get("absent")).isNull();
        assertThat(map.containsKey("absent")).isFalse();
    }

    @Test
    @DisplayName("M04 §3 · Hashtable rejects a null key and a null value")
    void hashtable_rejectsNullKeyAndNullValue() {
        Map<String, String> table = new Hashtable<>();

        assertThatThrownBy(() -> table.put(null, "value")).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> table.put("key", null)).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("M04 §3 · ConcurrentHashMap rejects a null key and a null value")
    void concurrentHashMap_rejectsNullKeyAndNullValue() {
        Map<String, String> map = new ConcurrentHashMap<>();

        assertThatThrownBy(() -> map.put(null, "value")).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> map.put("key", null)).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("M04 §3 · \"Aa\" and \"BB\" share a hash code")
    void aaAndBb_shareHashCode() {
        assertThat("Aa".hashCode()).isEqualTo("BB".hashCode()).isEqualTo(2112);
    }

    @Test
    @DisplayName("M04 §3 · strings built from \"Aa\" and \"BB\" blocks all share one hash code")
    void blocksOfAaAndBb_produceOneHashCodeForEveryCombination() {
        List<String> keys = List.of("AaAaAa", "AaAaBB", "AaBBAa", "AaBBBB", "BBAaAa", "BBAaBB", "BBBBAa", "BBBBBB");

        assertThat(keys).extracting(String::hashCode).containsOnly("AaAaAa".hashCode());
    }

    @Test
    @DisplayName("M04 §3 · keys with one shared hash code are still told apart by equals")
    void collidingKeys_areAllRetrievable() {
        Map<CollidingKey, Integer> map = new HashMap<>();
        IntStream.rangeClosed(1, COLLIDING_KEYS).forEach(i -> map.put(new CollidingKey("k" + i), i));

        assertThat(map).hasSize(COLLIDING_KEYS);
        IntStream.rangeClosed(1, COLLIDING_KEYS)
                .forEach(i -> assertThat(map.get(new CollidingKey("k" + i))).isEqualTo(i));
        assertThat(map.get(new CollidingKey("missing"))).isNull();
    }

    @Test
    @DisplayName("M04 §3 · put returns the previous value and a replaced value is not a new entry")
    void put_returnsPreviousValue_andKeepsSize() {
        Map<String, Integer> map = new HashMap<>();

        assertThat(map.put("a", 1)).isNull();
        assertThat(map.put("a", 2)).isEqualTo(1);
        assertThat(map).hasSize(1).containsEntry("a", 2);
    }

    @Test
    @DisplayName("M04 §3 · reading HashMap.table in this JVM fails because java.util is not opened")
    void tableProbe_fails_withoutAddOpens() {
        HashMap<String, Integer> map = new HashMap<>();

        assertThatThrownBy(() -> TableProbe.capacity(map)).isInstanceOf(InaccessibleObjectException.class);
    }
}
