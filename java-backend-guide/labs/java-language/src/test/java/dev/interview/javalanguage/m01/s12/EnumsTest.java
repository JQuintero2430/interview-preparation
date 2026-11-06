package dev.interview.javalanguage.m01.s12;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Arrays;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 01 §12 at runtime: constant-specific bodies, the valueOf failure and the safe parse of untrusted input.
class EnumsTest {

    private static final long CENTS = 1000L;
    private static final long CENTS_AFTER_TEN_PERCENT = 900L;
    private static final long CENTS_AFTER_FLAT_FIVE = 500L;
    private static final long CENTS_BELOW_FLAT_FIVE = 300L;
    private static final String UNKNOWN_NAME = "UNKNOWN";
    private static final String PADDED_MIXED_CASE_NAME = "  percent_ten  ";
    private static final String EMPTY = "";
    private static final String BLANK = " \t ";

    @Test
    @DisplayName("M01 §12 · constant-specific body overrides the method")
    void apply_usesTheConstantBody_whenCalledOnEachConstant() {
        assertThat(Discount.NONE.apply(CENTS)).isEqualTo(CENTS);
        assertThat(Discount.PERCENT_TEN.apply(CENTS)).isEqualTo(CENTS_AFTER_TEN_PERCENT);
        assertThat(Discount.FLAT_FIVE.apply(CENTS)).isEqualTo(CENTS_AFTER_FLAT_FIVE);
    }

    @Test
    void apply_returnsZero_whenFlatFiveExceedsTheAmount() {
        assertThat(Discount.FLAT_FIVE.apply(CENTS_BELOW_FLAT_FIVE)).isZero();
        assertThat(Discount.FLAT_FIVE.apply(0L)).isZero();
    }

    @Test
    void label_isDistinctAndNonNull_whenReadFromEveryConstant() {
        assertThat(Arrays.stream(Discount.values()).map(Discount::label))
                .doesNotContainNull()
                .doesNotHaveDuplicates()
                .hasSize(Discount.values().length);
    }

    @Test
    @DisplayName("M01 §12 · valueOf with an unknown name throws IllegalArgumentException")
    void valueOf_throwsIllegalArgument_whenTheNameIsUnknown() {
        assertThatThrownBy(() -> Discount.valueOf(UNKNOWN_NAME)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("M01 §12 · parse returns empty for an unknown name")
    void parse_returnsEmpty_whenTheNameIsUnknown() {
        assertThat(Discount.parse(UNKNOWN_NAME)).isEmpty();
    }

    @Test
    void parse_returnsEmpty_whenTheInputIsNull() {
        assertThat(Discount.parse(null)).isEmpty();
    }

    @Test
    void parse_returnsEmpty_whenTheInputIsEmptyOrBlank() {
        assertThat(Discount.parse(EMPTY)).isEmpty();
        assertThat(Discount.parse(BLANK)).isEmpty();
    }

    @Test
    void parse_returnsTheConstant_whenTheNameIsPaddedAndMixedCase() {
        assertThat(Discount.parse(PADDED_MIXED_CASE_NAME)).contains(Discount.PERCENT_TEN);
    }

    @Test
    void parse_returnsTheConstant_whenTheNameIsExact() {
        assertThat(Discount.parse(Discount.FLAT_FIVE.name())).contains(Discount.FLAT_FIVE);
    }

    @Test
    @DisplayName("M01 §12 · ordinal follows declaration order")
    void ordinal_followsDeclarationOrder_whenReadFromEveryConstant() {
        assertThat(Discount.NONE.ordinal()).isZero();
        assertThat(Discount.PERCENT_TEN.ordinal()).isEqualTo(1);
        assertThat(Discount.FLAT_FIVE.ordinal()).isEqualTo(2);
        assertThat(Discount.values()).containsExactly(Discount.NONE, Discount.PERCENT_TEN, Discount.FLAT_FIVE);
    }

    @Test
    @DisplayName("M01 §12 · a constant with a body is an instance of an anonymous subclass"
            + " (getClass differs from getDeclaringClass)")
    void getClass_differsFromGetDeclaringClass_whenTheConstantHasABody() {
        assertThat(Discount.PERCENT_TEN.getDeclaringClass()).isEqualTo(Discount.class);
        assertThat(Discount.PERCENT_TEN.getClass()).isNotEqualTo(Discount.class);
        assertThat(Discount.PERCENT_TEN.getClass().isAnonymousClass()).isTrue();
        assertThat(Discount.PERCENT_TEN.getClass().getSuperclass()).isEqualTo(Discount.class);
    }
}
