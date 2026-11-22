package dev.interview.javalanguage.m04.ex2;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.stream.IntStream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SimpleHashMapTest {

    private final SimpleHashMap<Object, String> map = new SimpleHashMap<>();

    @Test
    @DisplayName("Ex04.2 · (1) put, get and remove agree with java.util.HashMap on 20,000 random operations (seed 42)")
    void agreesWithHashMap() {
        Map<Integer, String> expected = new HashMap<>();
        SimpleHashMap<Integer, String> actual = new SimpleHashMap<>();
        Random random = new Random(42);

        for (int step = 0; step < 20_000; step++) {
            int draw = random.nextInt(501);
            Integer key = draw == 500 ? null : draw;
            switch (random.nextInt(3)) {
                case 0 -> assertThat(actual.put(key, "v" + step)).isEqualTo(expected.put(key, "v" + step));
                case 1 -> assertThat(actual.get(key)).isEqualTo(expected.get(key));
                default -> assertThat(actual.remove(key)).isEqualTo(expected.remove(key));
            }
            assertThat(actual.size()).isEqualTo(expected.size());
        }
        for (int draw = 0; draw <= 500; draw++) {
            Integer key = draw == 500 ? null : draw;
            assertThat(actual.containsKey(key)).isEqualTo(expected.containsKey(key));
            assertThat(actual.get(key)).isEqualTo(expected.get(key));
        }
    }

    @Test
    @DisplayName("Ex04.2 · (2) a null key is supported, has hash 0 and lives in bin 0")
    void nullKeyIsSupported() {
        assertThat(map.put(null, "first")).isNull();
        assertThat(map.put(null, "second")).isEqualTo("first");

        assertThat(SimpleHashMap.spread(null)).isZero();
        assertThat(map.nodesInBin(0)).isEqualTo(1);
        assertThat(map.get(null)).isEqualTo("second");
        assertThat(map.containsKey(null)).isTrue();
        assertThat(map.size()).isEqualTo(1);
        assertThat(map.remove(null)).isEqualTo("second");
        assertThat(map.containsKey(null)).isFalse();
        assertThat(map.size()).isZero();
    }

    @Test
    @DisplayName("Ex04.2 · (3) the table doubles on the 13th, 25th and 49th new key, and every entry is still found")
    void doublesPastThreeQuartersAndKeepsEntries() {
        assertThat(map.capacity()).isEqualTo(16);
        IntStream.range(0, 12).forEach(i -> map.put(i, "v" + i));
        map.put(0, "replaced");
        assertThat(map.capacity()).as("12 keys and one replacement").isEqualTo(16);

        map.put(12, "v12");
        assertThat(map.capacity()).isEqualTo(32);
        IntStream.range(13, 24).forEach(i -> map.put(i, "v" + i));
        assertThat(map.capacity()).as("24 keys").isEqualTo(32);
        map.put(24, "v24");
        assertThat(map.capacity()).isEqualTo(64);
        IntStream.range(25, 49).forEach(i -> map.put(i, "v" + i));
        assertThat(map.capacity()).isEqualTo(128);

        assertThat(map.size()).isEqualTo(49);
        assertThat(map.get(0)).isEqualTo("replaced");
        IntStream.range(1, 49).forEach(i -> assertThat(map.get(i)).isEqualTo("v" + i));
    }

    @Test
    @DisplayName("Ex04.2 · (3) a resize moves keys by the stored hash: hashCode is never called during it")
    void resizeReusesStoredHashes() {
        Counter counter = new Counter();
        SimpleHashMap<CountingKey, Integer> counted = new SimpleHashMap<>();
        IntStream.range(0, 13).forEach(i -> counted.put(new CountingKey(i, i * 31, counter), i));

        assertThat(counted.capacity()).isEqualTo(32);
        assertThat(counter.hashCodeCalls).as("one per put, none in the resize").isEqualTo(13);
        IntStream.range(0, 13)
                .forEach(i -> assertThat(counted.get(new CountingKey(i, i * 31, counter)))
                        .isEqualTo(i));
    }

    @Test
    @DisplayName(
            "Ex04.2 · (4) \"Aa\" and \"BB\" share a hash code, coexist in one bucket and are removed independently")
    void equalHashCodesShareABucket() {
        assertThat("Aa".hashCode()).isEqualTo("BB".hashCode()).isEqualTo(2112);
        int bin = SimpleHashMap.indexFor(SimpleHashMap.spread("Aa"), map.capacity());

        map.put("Aa", "first");
        map.put("BB", "second");

        assertThat(map.nodesInBin(bin)).isEqualTo(2);
        assertThat(map.get("Aa")).isEqualTo("first");
        assertThat(map.get("BB")).isEqualTo("second");
        assertThat(map.remove("Aa")).isEqualTo("first");
        assertThat(map.nodesInBin(bin)).isEqualTo(1);
        assertThat(map.get("BB")).isEqualTo("second");
        assertThat(map.get("Aa")).isNull();
    }

    @Test
    @DisplayName("Ex04.2 · (5) equals runs only on a node whose stored hash matches the lookup hash")
    void equalsOnlyAfterHashMatches() {
        Counter counter = new Counter();
        SimpleHashMap<CountingKey, String> counted = new SimpleHashMap<>();
        // Hash codes 1, 17 and 33 differ, but all three land in bin 1 of a 16-slot table.
        counted.put(new CountingKey(1, 1, counter), "one");
        counted.put(new CountingKey(17, 17, counter), "seventeen");
        counted.put(new CountingKey(33, 33, counter), "thirty-three");
        assertThat(counted.nodesInBin(1)).isEqualTo(3);
        assertThat(counter.equalsCalls)
                .as("distinct hashes in one bin, during the puts")
                .isZero();

        assertThat(counted.get(new CountingKey(33, 33, counter))).isEqualTo("thirty-three");
        assertThat(counter.equalsCalls).as("only the third node's hash matches").isEqualTo(1);

        assertThat(counted.get(new CountingKey(49, 49, counter))).isNull();
        assertThat(counter.equalsCalls)
                .as("a fourth hash in bin 1 matches no node")
                .isEqualTo(1);
    }

    private static final class Counter {
        private int hashCodeCalls;
        private int equalsCalls;
    }

    // A key whose hash code is chosen by the test and which counts the calls the map makes on it.
    private static final class CountingKey {

        private final int id;
        private final int hash;
        private final Counter counter;

        CountingKey(int id, int hash, Counter counter) {
            this.id = id;
            this.hash = hash;
            this.counter = counter;
        }

        @Override
        public boolean equals(Object other) {
            counter.equalsCalls++;
            return other instanceof CountingKey key && key.id == id;
        }

        @Override
        public int hashCode() {
            counter.hashCodeCalls++;
            return hash;
        }
    }
}
