package dev.interview.javalanguage.m01.s10;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.math.BigInteger;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 01 §10: the guide quotes Tax whole, so the constant, the exact-multiplication overflow guard and the
// utility-class shape (final, private constructor) are the contract worth locking.
class TaxTest {

    private static final long NET_1000 = 1000L;
    private static final long TAX_ON_1000 = 210L;
    private static final long ONE_CENT = 1L;
    private static final long REFUND_NET = -100L;
    private static final long REFUND_TAX = -21L;
    private static final long LARGEST_ACCEPTED = Long.MAX_VALUE / Tax.RATE_PERCENT;
    private static final BigInteger EXPECTED_TAX_AT_LARGEST = BigInteger.valueOf(LARGEST_ACCEPTED)
            .multiply(BigInteger.valueOf(21))
            .divide(BigInteger.valueOf(100));
    private static final int EXPECTED_RATE = 21;
    private static final String RATE_FIELD = "RATE_PERCENT";

    @Test
    @DisplayName("M01 §10 · taxCents returns the tax for a positive amount")
    void taxCents_returnsTheTax_whenTheAmountIsPositive() {
        assertThat(Tax.taxCents(NET_1000)).isEqualTo(TAX_ON_1000);
    }

    @Test
    @DisplayName("M01 §10 · taxCents of zero is zero")
    void taxCents_returnsZero_whenTheAmountIsZero() {
        assertThat(Tax.taxCents(0L)).isZero();
    }

    @Test
    @DisplayName("M01 §10 · taxCents truncates a sub-cent result")
    void taxCents_truncatesToZero_whenTheResultIsBelowOneCent() {
        assertThat(Tax.taxCents(ONE_CENT)).isZero();
    }

    @Test
    @DisplayName("M01 §10 · taxCents returns a negative tax for a refund")
    void taxCents_returnsNegativeTax_whenTheAmountIsNegative() {
        assertThat(Tax.taxCents(REFUND_NET)).isEqualTo(REFUND_TAX);
    }

    @Test
    @DisplayName("M01 §10 · taxCents does not overflow at the largest accepted amount")
    void taxCents_returnsExactTax_whenTheAmountIsTheLargestAccepted() {
        assertThat(BigInteger.valueOf(Tax.taxCents(LARGEST_ACCEPTED))).isEqualTo(EXPECTED_TAX_AT_LARGEST);
    }

    @Test
    @DisplayName("M01 §10 · taxCents throws instead of returning a wrapped value")
    void taxCents_throwsArithmeticException_whenTheMultiplicationOverflows() {
        assertThatThrownBy(() -> Tax.taxCents(Long.MAX_VALUE)).isInstanceOf(ArithmeticException.class);
    }

    @Test
    @DisplayName("M01 §10 · Tax is final")
    void tax_isFinal() {
        assertThat(Modifier.isFinal(Tax.class.getModifiers())).isTrue();
    }

    @Test
    @DisplayName("M01 §10 · the only constructor of Tax is private")
    void tax_hasOnlyAPrivateConstructor() {
        Constructor<?>[] constructors = Tax.class.getDeclaredConstructors();

        assertThat(constructors).hasSize(1);
        assertThat(Modifier.isPrivate(constructors[0].getModifiers())).isTrue();
    }

    @Test
    @DisplayName("M01 §10 · RATE_PERCENT is a public static final 21")
    void ratePercentConstant_isPublicStaticFinalWithValue21() throws NoSuchFieldException {
        Field field = Tax.class.getField(RATE_FIELD);

        assertThat(Modifier.isPublic(field.getModifiers())).isTrue();
        assertThat(Modifier.isStatic(field.getModifiers())).isTrue();
        assertThat(Modifier.isFinal(field.getModifiers())).isTrue();
        assertThat(Tax.RATE_PERCENT).isEqualTo(EXPECTED_RATE);
    }
}
