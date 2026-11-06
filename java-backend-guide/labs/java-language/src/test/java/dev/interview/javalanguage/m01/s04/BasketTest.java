package dev.interview.javalanguage.m01.s04;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class BasketTest {

    private static final String HOUSE_ITEM = "bread";
    private static final String CUSTOMER_ITEM = "coffee";

    @Test
    @DisplayName("M01 §4 · copy constructor gives an independent object")
    void copyConstructor_givesTheCopyItsOwnList() {
        Basket defaults = new Basket();
        defaults.add(HOUSE_ITEM);

        Basket order = new Basket(defaults);
        order.add(CUSTOMER_ITEM);

        assertThat(order).isNotSameAs(defaults);
        assertThat(order.items()).containsExactly(HOUSE_ITEM, CUSTOMER_ITEM);
        assertThat(defaults.items()).containsExactly(HOUSE_ITEM);
    }

    @Test
    @DisplayName("M01 §4 · assignment copies the reference, not the object")
    void assignment_sharesOneObjectBetweenTwoVariables() {
        Basket defaults = new Basket();
        defaults.add(HOUSE_ITEM);

        Basket order = defaults;
        order.add(CUSTOMER_ITEM);

        assertThat(order).isSameAs(defaults);
        assertThat(defaults.items()).containsExactly(HOUSE_ITEM, CUSTOMER_ITEM);
    }

    @Test
    @DisplayName("M01 §4 · items() is an unmodifiable snapshot")
    void items_isUnmodifiable_andDoesNotFollowLaterAdds() {
        Basket basket = new Basket();
        basket.add(HOUSE_ITEM);

        var snapshot = basket.items();
        basket.add(CUSTOMER_ITEM);

        assertThat(snapshot).containsExactly(HOUSE_ITEM);
        assertThatThrownBy(() -> snapshot.add(CUSTOMER_ITEM)).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("M01 §4 · add rejects null")
    void add_rejectsNull() {
        Basket basket = new Basket();

        assertThatThrownBy(() -> basket.add(null))
                .isInstanceOf(NullPointerException.class)
                .hasMessage(Basket.NULL_ITEM);
    }
}
