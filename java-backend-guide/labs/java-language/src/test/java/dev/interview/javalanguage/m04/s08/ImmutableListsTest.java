package dev.interview.javalanguage.m04.s08;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ImmutableListsTest {

    @Test
    @DisplayName("M04 §8 · List.of(...).contains(null) throws NullPointerException")
    void listOf_containsNull_throws() {
        assertThatThrownBy(() -> List.of("a", "b").contains(null)).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> List.of("a", "b", "c").indexOf(null)).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> List.of().contains(null)).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> List.of("a", null)).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("M04 §8 · Set.of and Map.of throw NullPointerException for null queries")
    void setOfAndMapOf_nullQueries_throw() {
        assertThatThrownBy(() -> Set.of("a").contains(null)).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> Set.of("a", "b", "c").contains(null)).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> Map.of("k", "v").containsKey(null)).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("M04 §8 · List.of rejects every mutator, even one that would change nothing")
    void listOf_everyMutatorThrows() {
        List<String> list = List.of("b", "a");
        assertThatThrownBy(() -> list.add("c")).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> list.set(0, "z")).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> list.sort(Comparator.naturalOrder()))
                .isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> list.removeIf(s -> false)).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> list.addAll(List.of())).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("M04 §8 · the subList and reversed views of List.of are unmodifiable too")
    void listOf_views_areUnmodifiable() {
        List<String> list = List.of("a", "b", "c");
        assertThatThrownBy(() -> list.subList(0, 2).set(0, "z")).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> list.reversed().add("z")).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("M04 §8 · Arrays.asList writes through to the array and rejects add")
    void arraysAsList_writesThrough_rejectsAdd() {
        String[] array = {"c", "a", "b"};
        List<String> list = Arrays.asList(array);

        list.set(0, "z");
        assertThat(array).containsExactly("z", "a", "b");

        array[1] = "y";
        assertThat(list).containsExactly("z", "y", "b");

        list.sort(Comparator.naturalOrder());
        assertThat(array).containsExactly("b", "y", "z");

        assertThatThrownBy(() -> list.add("d")).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> list.remove(0)).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("M04 §8 · Arrays.asList removeIf throws only when an element matches")
    void arraysAsList_removeIf_throwsOnlyOnMatch() {
        List<String> list = Arrays.asList("a", "b");
        assertThat(list.removeIf(s -> s.equals("x"))).isFalse();
        assertThatThrownBy(() -> list.removeIf(s -> s.equals("a"))).isInstanceOf(UnsupportedOperationException.class);
        assertThat(list).containsExactly("a", "b");
    }

    @Test
    @DisplayName("M04 §8 · Arrays.asList(int[]) has one element")
    void arraysAsList_primitiveArray_isOneElement() {
        int[] primitives = {1, 2, 3};
        List<int[]> wrapped = Arrays.asList(primitives);
        assertThat(wrapped).hasSize(1);
        assertThat(wrapped.get(0)).isSameAs(primitives);

        Integer[] boxed = {1, 2, 3};
        assertThat(Arrays.asList(boxed)).hasSize(3).contains(1);
        assertThat(List.of(1, 2, 3)).hasSize(3);
    }

    @Test
    @DisplayName("M04 §8 · Arrays.asList over a String[] seen as Object[] throws ArrayStoreException on set")
    void arraysAsList_covariantArray_arrayStoreException() {
        Object[] objects = new String[] {"a", "b"};
        List<Object> list = Arrays.asList(objects);
        assertThatThrownBy(() -> list.set(0, 42)).isInstanceOf(ArrayStoreException.class);
    }

    @Test
    @DisplayName("M04 §8 · Arrays.asList and an unmodifiable view of an ArrayList accept null queries")
    void mutableBackedLists_acceptNullQueries() {
        List<String> fixed = Arrays.asList("a", null);
        assertThat(fixed.contains(null)).isTrue();

        List<String> view = Collections.unmodifiableList(new ArrayList<>(List.of("a")));
        assertThat(view.contains(null)).isFalse();
    }

    @Test
    @DisplayName("M04 §8 · Collections.unmodifiableList rejects set, add and sort")
    void unmodifiableList_rejectsWrites() {
        List<String> view = Collections.unmodifiableList(new ArrayList<>(List.of("b", "a")));
        assertThatThrownBy(() -> view.set(0, "z")).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> view.add("c")).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> view.sort(null)).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("M04 §8 · Stream.toList accepts null and rejects set")
    void streamToList_acceptsNull_rejectsSet() {
        List<String> list = Stream.of("a", null, "c").toList();
        assertThat(list).containsExactly("a", null, "c");
        assertThat(list.contains(null)).isTrue();
        assertThatThrownBy(() -> list.set(0, "z")).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> list.add("d")).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("M04 §8 · Collectors.toUnmodifiableList rejects null")
    void toUnmodifiableList_rejectsNull() {
        assertThatThrownBy(() -> Stream.of("a", null).collect(Collectors.toUnmodifiableList()))
                .isInstanceOf(NullPointerException.class);
        List<String> list = Stream.of("a", "b").collect(Collectors.toUnmodifiableList());
        assertThatThrownBy(() -> list.add("c")).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("M04 §8 · in JDK 25 Collectors.toList returns an ArrayList (implementation, not contract)")
    void collectorsToList_isArrayListInJdk25() {
        List<String> list = Stream.of("b", "a", null).collect(Collectors.toList());
        assertThat(list).isInstanceOf(ArrayList.class);
        list.add("c");
        assertThat(list).containsExactly("b", "a", null, "c");
    }

    @Test
    @DisplayName("M04 §8 · List.copyOf copies a Stream.toList result, which may hold null")
    void listCopyOf_streamToList_isCopied() {
        List<String> fromStream = Stream.of("a", "b").toList();
        assertThat(List.copyOf(fromStream)).isNotSameAs(fromStream).isEqualTo(fromStream);

        List<String> withNull = Stream.of("a", null).toList();
        assertThatThrownBy(() -> List.copyOf(withNull)).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("M04 §8 · sorting a Stream.toList result fails inside ImmutableCollections")
    void sortingStreamToList_failsInImmutableCollections() {
        List<String> names = Stream.of("b", "a").toList();
        assertThatThrownBy(() -> Collections.sort(names))
                .isInstanceOf(UnsupportedOperationException.class)
                .satisfies(e ->
                        assertThat(e.getStackTrace()[0].getClassName()).startsWith("java.util.ImmutableCollections"));
    }
}
