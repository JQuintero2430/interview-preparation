package dev.interview.javalanguage.m03.s06;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Module 03 §6: what a generic array really is at run time, and where its type error surfaces.
class GenericArrayTest {

    private static final int CAPACITY = 2;
    private static final int LENGTH = 3;
    private static final int FIRST = 0;
    private static final String A = "a";
    private static final String B = "b";
    private static final String OBJECT_ARRAY = "[Ljava.lang.Object;";

    @Test
    @DisplayName("M03 §6 · a (T[]) new Object[] that escapes throws ClassCastException at the caller")
    void snapshot_throwsClassCastExceptionAtCaller_whenBackingArrayIsObjectArray() {
        SnapshotBuffer<String> buffer = bufferOf(A, B);

        String first = buffer.get(FIRST);

        assertThat(first).isEqualTo(A);
        assertThatThrownBy(() -> {
                    String[] snapshot = buffer.snapshot();
                    assertThat(snapshot).isNotNull();
                })
                .isInstanceOf(ClassCastException.class)
                .hasMessageContaining(OBJECT_ARRAY);
    }

    @Test
    @DisplayName("M03 §6 · Array.newInstance makes a real String[]")
    void newArray_returnsStringArray_whenGivenStringClass() {
        String[] array = TypedArrays.newArray(String.class, LENGTH);
        String[] snapshot = bufferOf(A, B).snapshot(String[]::new);

        assertThat(array.getClass()).isEqualTo(String[].class);
        assertThat(array).hasSize(LENGTH);
        assertThat(snapshot.getClass()).isEqualTo(String[].class);
        assertThat(snapshot).containsExactly(A, B);
    }

    @Test
    @DisplayName("M03 §6 · a varargs array stored through an Object[] view pollutes the heap")
    void firstElement_throwsClassCastException_whenVarargsArrayWasPolluted() {
        List<String> names = List.of(A);

        assertThatThrownBy(() -> VarargsPollution.firstElement(names))
                .isInstanceOf(ClassCastException.class)
                .isNotInstanceOf(ArrayStoreException.class);
    }

    @Test
    @DisplayName("M03 §6 · SnapshotBuffer.toList returns the elements in insertion order")
    void toList_returnsElementsInOrder_whenBufferHasElements() {
        assertThat(bufferOf(A, B).toList()).containsExactly(A, B);
        assertThat(new SnapshotBuffer<String>(CAPACITY).toList()).isEmpty();
    }

    @Test
    @DisplayName("M03 §6 · SnapshotBuffer rejects null and an add past its capacity")
    void add_throws_whenElementIsNullOrBufferIsFull() {
        SnapshotBuffer<String> empty = new SnapshotBuffer<>(CAPACITY);
        SnapshotBuffer<String> full = bufferOf(A, B);

        assertThatThrownBy(() -> empty.add(null)).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> full.add(A)).isInstanceOf(IllegalStateException.class);
        assertThat(full.size()).isEqualTo(CAPACITY);
    }

    private static SnapshotBuffer<String> bufferOf(String first, String second) {
        SnapshotBuffer<String> buffer = new SnapshotBuffer<>(CAPACITY);
        buffer.add(first);
        buffer.add(second);
        return buffer;
    }
}
