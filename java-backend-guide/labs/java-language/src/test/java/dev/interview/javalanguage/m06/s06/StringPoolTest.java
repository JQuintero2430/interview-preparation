package dev.interview.javalanguage.m06.s06;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class StringPoolTest {

    private static final String PREFIX = "or";

    @Test
    @DisplayName("M06 §6 · literals and constant expressions share one pooled instance")
    void literalsAndConstantExpressions_shareOnePooledInstance() {
        final String constantVariable = "or";
        String literal = "order";

        assertThat(literal).isSameAs("order");
        assertThat(literal).isSameAs("or" + "der");
        assertThat(literal).isSameAs(PREFIX + "der");
        assertThat(literal).isSameAs(constantVariable + "der");
        assertThat(literal).isSameAs(OtherHolder.ORDER);
    }

    @Test
    @DisplayName("M06 §6 · runtime concatenation creates a new string and intern returns the pooled one")
    void runtimeConcatenation_isNewAndInternReturnsPooled() {
        String notConstant = "or";
        String computed = notConstant + "der";

        assertThat(computed).isEqualTo("order").isNotSameAs("order");
        assertThat(computed.intern()).isSameAs("order");
    }

    @Test
    @DisplayName("M06 §6 · new String makes a distinct object with the same contents")
    void newString_isDistinctButEqual() {
        String created = new String("order");

        assertThat(created).isEqualTo("order").isNotSameAs("order");
        assertThat(created.intern()).isSameAs("order");
    }

    @Test
    @DisplayName("M06 §6 · + with a number converts by the evaluation order of the operands")
    void plusWithNumbers_followsLeftToRightEvaluation() {
        assertThat(1 + 2 + "3").isEqualTo("33");
        assertThat("1" + 2 + 3).isEqualTo("123");
        assertThat("total " + 0.1 + 0.2).isEqualTo("total 0.10.2");
        assertThat("total " + (0.1 + 0.2)).isEqualTo("total 0.30000000000000004");
        assertThat("x" + null).isEqualTo("xnull");
    }

    // A constant in another class is still the same pooled instance.
    private static final class OtherHolder {
        static final String ORDER = "order";
    }
}
