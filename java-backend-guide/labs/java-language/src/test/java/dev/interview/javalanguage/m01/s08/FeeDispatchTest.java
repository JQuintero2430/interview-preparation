package dev.interview.javalanguage.m01.s08;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 01 §8: overloads are chosen by the static type at compile time, overrides by the runtime class.
class FeeDispatchTest {

    @Test
    @DisplayName("M01 §8 · overload chosen by static type")
    void overload_isChosenByTheStaticTypeOfTheArgument() {
        CardPayment card = new CardPayment(10_000);
        Payment sameCardAsPayment = card;

        assertThat(FeeTable.feeCents(card)).isEqualTo(200);
        assertThat(FeeTable.feeCents(sameCardAsPayment)).isZero();
    }

    @Test
    @DisplayName("M01 §8 · override chosen by runtime class")
    void override_isChosenByTheRuntimeClassOfTheReceiver() {
        List<Payment> payments = List.of(new Payment(10_000), new CardPayment(10_000));

        assertThat(payments).extracting(Payment::feeCents).containsExactly(0L, 200L);
    }
}
