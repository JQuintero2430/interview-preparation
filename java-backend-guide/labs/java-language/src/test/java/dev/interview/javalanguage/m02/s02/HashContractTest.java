package dev.interview.javalanguage.m02.s02;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m02.s01.Point;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 02 §2: the hashCode contract and what HashMap and HashSet do when a key breaks it.
class HashContractTest {

    private static final String CODE_A = "A";
    private static final String CODE_B = "B";
    private static final int SAMPLE_SIZE = 1000;
    private static final int STORED_VALUE = 10;
    private static final int OBJECTS_HASH_OF_1_2 = 994;
    private static final int POINT_HASH_OF_1_2 = 33;

    @Test
    @DisplayName("M02 §2 · equal points with a matching hashCode collapse to one HashSet entry")
    void hashSet_collapsesEqualPoints_whenHashCodesMatch() {
        Point a = new Point(1, 2);
        Point b = new Point(1, 2);
        Set<Point> both = new HashSet<>(Set.of(a));
        both.add(b);
        Set<Point> onlyA = new HashSet<>(Set.of(a));

        assertThat(a.hashCode() == b.hashCode()).isTrue();
        assertThat(both).hasSize(1);
        assertThat(onlyA.contains(b)).isTrue();
    }

    @Test
    @DisplayName("M02 §2 · equals without hashCode: a fresh equal key is found only when the hash codes match")
    void noHashPoint_isFoundOnlyWhenHashCodesMatch_whenEqualsIsOverriddenAlone() {
        // Identity hashes almost always differ but that is not guaranteed, so the test asserts the
        // relationship (STYLE-GUIDE §7.5).
        for (int i = 0; i < SAMPLE_SIZE; i++) {
            NoHashPoint a = new NoHashPoint(i, i);
            NoHashPoint b = new NoHashPoint(i, i);
            boolean sameHash = a.hashCode() == b.hashCode();
            Set<NoHashPoint> onlyA = new HashSet<>();
            onlyA.add(a);
            Set<NoHashPoint> both = new HashSet<>();
            both.add(a);
            both.add(b);

            assertThat(a.equals(b)).isTrue();
            assertThat(onlyA.contains(b)).isEqualTo(sameHash);
            assertThat(both).hasSize(sameHash ? 1 : 2);
        }
    }

    @Test
    @DisplayName("M02 §2 · a mutated key is not found by get but is still in the map")
    void hashMap_losesMutatedKey_whileEntryRemains() {
        Sku key = new Sku(CODE_A);
        assertThat(Objects.hashCode(CODE_A)).isNotEqualTo(Objects.hashCode(CODE_B));
        Map<Sku, Integer> map = new HashMap<>();
        map.put(key, STORED_VALUE);

        key.setCode(CODE_B);

        assertThat(map.get(key)).isNull();
        assertThat(map.get(new Sku(CODE_A))).isNull();
        assertThat(map.get(new Sku(CODE_B))).isNull();
        assertThat(map.containsKey(key)).isFalse();
        assertThat(map).hasSize(1);
        assertThat(map.containsValue(STORED_VALUE)).isTrue();
        assertThat(map.keySet().stream().anyMatch(sku -> CODE_B.equals(sku.code())))
                .isTrue();
        assertThat(map.remove(key)).isNull();
        assertThat(map).hasSize(1);
    }

    @Test
    @DisplayName("M02 §2 · Objects.hash is Arrays.hashCode over the boxed arguments")
    void objectsHash_equalsArraysHashCode_overBoxedArguments() {
        int viaObjects = Objects.hash(1, 2);
        int viaArrays = Arrays.hashCode(new Object[] {1, 2});
        int handWritten = new Point(1, 2).hashCode();

        assertThat(viaObjects).isEqualTo(viaArrays).isEqualTo(OBJECTS_HASH_OF_1_2);
        assertThat(handWritten).isEqualTo(POINT_HASH_OF_1_2);
    }
}
