package dev.interview.javalanguage.m01.s04;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Java passes references by value (JLS §8.4.1): the callee can change the object, never the caller's variable.
class PassByValueTest {

    private static final String FIRST = "first";
    private static final String SECOND = "second";

    @Test
    @DisplayName("M01 §4 · swap of references does not affect the caller")
    void swap_leavesTheCallerVariablesPointingAtTheSameObjects() {
        Basket a = basketWith(FIRST);
        Basket b = basketWith(SECOND);
        Basket originalA = a;
        Basket originalB = b;

        PassByValue.swap(a, b);

        assertThat(a).isSameAs(originalA);
        assertThat(b).isSameAs(originalB);
        assertThat(a.items()).containsExactly(FIRST);
    }

    @Test
    @DisplayName("M01 §4 · mutation through a parameter is visible")
    void addThrough_changesTheCallersObject() {
        Basket basket = basketWith(FIRST);

        PassByValue.addThrough(basket, SECOND);

        assertThat(basket.items()).containsExactly(FIRST, SECOND);
    }

    @Test
    @DisplayName("M01 §4 · reassigning a parameter does not affect the caller")
    void reassign_isInvisibleToTheCaller() {
        Basket basket = basketWith(FIRST);
        Basket original = basket;

        PassByValue.reassign(basket, SECOND);

        assertThat(basket).isSameAs(original);
        assertThat(basket.items()).containsExactly(FIRST);
    }

    private static Basket basketWith(String item) {
        Basket basket = new Basket();
        basket.add(item);
        return basket;
    }
}
