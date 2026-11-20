package dev.interview.javalanguage.m04.s01;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CollectionContractTest {

    @Test
    @DisplayName("M04 §1 · addAll returns false when nothing changed")
    void addAll_returnsWhetherTheCollectionChanged() {
        Set<String> tags = new HashSet<>(List.of("java", "spring"));

        assertThat(tags.addAll(List.of("java"))).isFalse();
        assertThat(tags.addAll(List.of("java", "kafka"))).isTrue();
        assertThat(tags).hasSize(3);
    }

    @Test
    @DisplayName("M04 §1 · an unmodifiable collection throws from add, even when addAll would change nothing")
    void unmodifiableCollection_throwsUnsupportedOperation_fromEveryMutator() {
        Collection<String> fixed = List.of("java");

        assertThatThrownBy(() -> fixed.add("spring")).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> fixed.addAll(List.of())).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("M04 §1 · removing from a Map's keySet removes the mapping")
    void keySetView_writesThroughToTheMap() {
        Map<String, Integer> stock = new HashMap<>(Map.of("apple", 3, "pear", 5));

        stock.keySet().remove("apple");

        assertThat(stock).containsOnlyKeys("pear");
    }
}
