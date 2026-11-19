package dev.interview.javalanguage.m03.s05;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Module 03 §5: what erasure leaves at run time, observed by running code.
class ErasureTest {

    private static final long TEN_CENTS = 10L;
    private static final String NOT_MONEY = "ten cents";

    @Test
    @DisplayName("M03 §5 · ArrayList<String> and ArrayList<Integer> have the same runtime class")
    void getClass_returnsSameClass_whenOnlyTypeArgumentsDiffer() {
        List<String> skus = new ArrayList<>();
        List<Integer> quantities = new ArrayList<>();

        assertThat(skus.getClass()).isSameAs(quantities.getClass()).isSameAs(ArrayList.class);
    }

    @Test
    @DisplayName("M03 §5 · the bridge method casts, so a raw call with the wrong type throws ClassCastException")
    @SuppressWarnings({"rawtypes", "unchecked"})
    void rawCompareTo_throwsClassCastException_whenArgumentIsNotMoney() {
        Comparable raw = new Money(TEN_CENTS);

        assertThatThrownBy(() -> raw.compareTo(NOT_MONEY))
                .isInstanceOf(ClassCastException.class)
                .hasMessageContaining(Money.class.getName());
    }
}
