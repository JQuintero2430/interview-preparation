package dev.interview.javalanguage.m04.s05;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.DayOfWeek;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SetsTest {

    @Test
    @DisplayName("M04 §5 · add returns false for an element that is already present")
    void hashSet_addReturnsFalse_forDuplicate() {
        Set<String> set = new HashSet<>();

        assertThat(set.add("a")).isTrue();
        assertThat(set.add("a")).isFalse();
        assertThat(set).hasSize(1);
    }

    @Test
    @DisplayName("M04 §5 · LinkedHashSet keeps the first insertion position of each element")
    void linkedHashSet_keepsFirstInsertionOrder() {
        Set<String> set = new LinkedHashSet<>(List.of("c", "a", "c", "b", "a"));

        assertThat(set).containsExactly("c", "a", "b");
    }

    @Test
    @DisplayName("M04 §5 · Set.of rejects duplicate elements with IllegalArgumentException")
    void setOf_rejectsDuplicatesAndNull() {
        assertThatThrownBy(() -> Set.of("a", "b", "a")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> Set.of("a", null)).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("M04 §5 · Set.copyOf keeps one of each duplicate instead of throwing")
    void setCopyOf_collapsesDuplicates() {
        Set<String> copy = Set.copyOf(List.of("a", "b", "a"));

        assertThat(copy).containsExactlyInAnyOrder("a", "b");
    }

    @Test
    @DisplayName("M04 §5 · TreeSet rejects null under natural ordering")
    void treeSet_rejectsNull_underNaturalOrdering() {
        Set<String> set = new TreeSet<>();

        assertThatThrownBy(() -> set.add(null)).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("M04 §5 · a TreeSet with a case-insensitive comparator keeps one of \"a\" and \"A\"")
    void treeSet_withCaseInsensitiveComparator_keepsFirstOfEqualElements() {
        TreeSet<String> set = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);

        assertThat(set.add("a")).isTrue();
        assertThat(set.add("A")).isFalse();
        assertThat(set).containsExactly("a");
        assertThat(set.contains("A")).isTrue();
    }

    @Test
    @DisplayName("M04 §5 · TreeSet navigates with first, floor and subSet")
    void treeSet_navigates() {
        TreeSet<Integer> set = new TreeSet<>(List.of(40, 10, 30, 20));

        assertThat(set.first()).isEqualTo(10);
        assertThat(set.floor(25)).isEqualTo(20);
        assertThat(set.subSet(15, 35)).containsExactly(20, 30);
    }

    @Test
    @DisplayName("M04 §5 · EnumSet.range returns constants in ordinal order")
    void enumSetRange_returnsOrdinalOrder() {
        Set<DayOfWeek> workWeek = EnumSet.range(DayOfWeek.MONDAY, DayOfWeek.FRIDAY);
        Set<DayOfWeek> weekend = EnumSet.complementOf(EnumSet.range(DayOfWeek.MONDAY, DayOfWeek.FRIDAY));

        assertThat(workWeek)
                .containsExactly(
                        DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY);
        assertThat(weekend).containsExactly(DayOfWeek.SATURDAY, DayOfWeek.SUNDAY);
    }

    @Test
    @DisplayName("M04 §5 · EnumSet.copyOf an empty list throws, because the element type is unknown")
    void enumSetCopyOf_emptyList_throws() {
        List<DayOfWeek> none = List.of();

        assertThatThrownBy(() -> EnumSet.copyOf(none)).isInstanceOf(IllegalArgumentException.class);
        assertThat(EnumSet.copyOf(EnumSet.noneOf(DayOfWeek.class))).isEmpty();
    }

    @Test
    @DisplayName("M04 §5 · two arrays with the same contents are two elements of a HashSet")
    void hashSet_ofArrays_usesIdentity() {
        Set<int[]> set = new HashSet<>();
        set.add(new int[] {1, 2});
        set.add(new int[] {1, 2});

        assertThat(set).hasSize(2);
        assertThat(set.contains(new int[] {1, 2})).isFalse();
    }
}
