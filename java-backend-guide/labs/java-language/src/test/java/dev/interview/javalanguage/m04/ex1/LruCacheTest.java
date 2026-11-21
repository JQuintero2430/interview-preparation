package dev.interview.javalanguage.m04.ex1;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class LruCacheTest {

    private final List<String> evicted = new ArrayList<>();
    private final LruCache<String, Integer> cache = new LruCache<>(2, (key, value) -> evicted.add(key + "=" + value));

    @Test
    @DisplayName("Ex04.1 · (1) capacity 2: put a, put b, get a, put c leaves [a, c] and evicts b")
    void evictsLeastRecentlyUsed() {
        cache.put("a", 1);
        cache.put("b", 2);
        cache.get("a");
        cache.put("c", 3);

        assertThat(cache.keys()).containsExactly("a", "c");
        assertThat(cache.get("b")).isEmpty();
        assertThat(cache.size()).isEqualTo(2);
    }

    @Test
    @DisplayName("Ex04.1 · (1) a put of an existing key replaces the value and counts as a use")
    void putOfExistingKeyIsAUse() {
        cache.put("a", 1);
        cache.put("b", 2);
        cache.put("a", 10);
        cache.put("c", 3);

        assertThat(cache.keys()).containsExactly("a", "c");
        assertThat(cache.get("a")).contains(10);
    }

    @Test
    @DisplayName("Ex04.1 · (2) get of an absent key is empty and changes no order")
    void absentKeyIsEmptyAndKeepsOrder() {
        cache.put("a", 1);
        cache.put("b", 2);

        assertThat(cache.get("x")).isEmpty();
        assertThat(cache.keys()).containsExactly("a", "b");
        cache.put("c", 3);
        assertThat(cache.keys()).containsExactly("b", "c");
    }

    @Test
    @DisplayName("Ex04.1 · (2) null keys and values are rejected, so an empty Optional always means absent")
    void nullKeyOrValueIsRejected() {
        assertThatThrownBy(() -> cache.put(null, 1))
                .isInstanceOf(NullPointerException.class)
                .hasMessage("key");
        assertThatThrownBy(() -> cache.put("a", null))
                .isInstanceOf(NullPointerException.class)
                .hasMessage("value");
        assertThat(cache.size()).isZero();
    }

    @Test
    @DisplayName("Ex04.1 · (3) the listener receives each evicted entry exactly once, and none for a replacement")
    void listenerSeesEachEvictionOnce() {
        cache.put("a", 1);
        cache.put("b", 2);
        cache.put("c", 3);
        cache.put("d", 4);
        cache.put("d", 40);

        assertThat(evicted).containsExactly("a=1", "b=2");
        assertThat(cache.keys()).containsExactly("c", "d");
    }

    @Test
    @DisplayName("Ex04.1 · (4) a capacity below 1 is rejected with IllegalArgumentException, a null listener with NPE")
    void invalidConstructionIsRejected() {
        EvictionListener<String, Integer> ignore = (key, value) -> {};

        assertThatThrownBy(() -> new LruCache<>(0, ignore))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("0");
        assertThatThrownBy(() -> new LruCache<>(-1, ignore)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new LruCache<String, Integer>(1, null))
                .isInstanceOf(NullPointerException.class)
                .hasMessage("listener");
        LruCache<String, Integer> single = new LruCache<>(1, ignore);
        single.put("a", 1);
        single.put("b", 2);
        assertThat(single.keys()).containsExactly("b");
    }

    @Test
    @DisplayName("Ex04.1 · (5) the cache is not a Map and exposes only get, put, size and keys")
    void composesInsteadOfExtending() {
        List<String> publicMethods = Arrays.stream(LruCache.class.getDeclaredMethods())
                .filter(m -> Modifier.isPublic(m.getModifiers()))
                .map(Method::getName)
                .toList();

        assertThat(Map.class.isAssignableFrom(LruCache.class)).isFalse();
        assertThat(LruCache.class.getSuperclass()).isEqualTo(Object.class);
        assertThat(publicMethods).containsExactlyInAnyOrder("get", "put", "size", "keys");
    }

    @Test
    @DisplayName("Ex04.1 · (5) keys() is an unmodifiable snapshot, and reading it does not count as a use")
    void keysIsAReadOnlySnapshot() {
        cache.put("a", 1);
        cache.put("b", 2);
        List<String> keys = cache.keys();

        assertThatThrownBy(() -> keys.add("x")).isInstanceOf(UnsupportedOperationException.class);
        cache.put("c", 3);
        assertThat(keys).containsExactly("a", "b");
        assertThat(cache.keys()).containsExactly("b", "c");
    }
}
