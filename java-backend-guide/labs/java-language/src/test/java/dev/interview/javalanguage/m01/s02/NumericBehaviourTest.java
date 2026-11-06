package dev.interview.javalanguage.m01.s02;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import dev.interview.javalanguage.m01.support.OutputCapture;
import java.math.BigDecimal;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Each test pins one JLS 25 rule from module 01 §2; the expressions under test are the claim, so they stay literal.
class NumericBehaviourTest {

    private static final String DOUBLE_SUM = "0.30000000000000004";
    private static final String EXACT_DOUBLE_TENTH_PREFIX = "0.1000000000000000055511151231257827";
    private static final int FLOAT_EXACT_LIMIT = 16_777_216;
    private static final String BYTE_PLUS_ONE_SOURCE = "class ByteSum { byte next(byte b) { b = b + 1; return b; } }";
    private static final String INCOMPATIBLE_TYPES = "compiler.err.prob.found.req";

    @Test
    @DisplayName("M01 §2 · int overflow wraps")
    void intAddition_wrapsToMinValue_whenItOverflows() {
        int max = Integer.MAX_VALUE;

        assertThat(max + 1).isEqualTo(Integer.MIN_VALUE);
    }

    @Test
    @DisplayName("M01 §2 · addExact throws on overflow")
    void addExact_throws_whenIntOverflows() {
        assertThatExceptionOfType(ArithmeticException.class)
                .isThrownBy(() -> Math.addExact(Integer.MAX_VALUE, 1))
                .withMessage("integer overflow");
    }

    @Test
    @DisplayName("M01 §2 · multiplyExact throws on long overflow")
    void multiplyExact_throws_whenLongOverflows() {
        assertThatExceptionOfType(ArithmeticException.class)
                .isThrownBy(() -> Math.multiplyExact(Long.MAX_VALUE, 2L))
                .withMessage("long overflow");
    }

    @Test
    @DisplayName("M01 §2 · integer division truncates toward zero and % takes the dividend's sign")
    void integerDivisionAndRemainder_followTheDividend() {
        assertThat(-7 / 2).isEqualTo(-3);
        assertThat(-7 % 2).isEqualTo(-1);
        assertThat(7 % -2).isEqualTo(1);
        assertThat(Math.floorMod(-7, 2)).isEqualTo(1);
    }

    @Test
    @DisplayName("M01 §2 · only integer division by zero throws")
    void divisionByZero_throwsOnlyForIntegers() {
        int zero = 0;

        // The division must be evaluated inside the lambda; printing is the shortest statement that uses it.
        assertThatExceptionOfType(ArithmeticException.class)
                .isThrownBy(() -> System.out.println(1 / zero))
                .withMessage("/ by zero");
        assertThat(1.0 / zero).isEqualTo(Double.POSITIVE_INFINITY);
        assertThat(Double.isNaN(0.0 / zero)).isTrue();
    }

    @Test
    @DisplayName("M01 §2 · NaN is not equal to itself")
    void nan_isNotEqualToItself() {
        double nan = Double.NaN;

        assertThat(nan != nan).isTrue();
    }

    @Test
    @DisplayName("M01 §2 · 0.1 + 0.2 is not 0.3 in double")
    void doubleSum_printsBinaryRoundingError() {
        assertThat(0.1 + 0.2).isNotEqualTo(0.3);
        assertThat(OutputCapture.linesOf(() -> System.out.println(0.1 + 0.2))).containsExactly(DOUBLE_SUM);
    }

    @Test
    @DisplayName("M01 §2 · BigDecimal from String is exact")
    void bigDecimal_isExactFromString_andCarriesTheDoubleErrorFromDouble() {
        assertThat(new BigDecimal("0.1")).hasToString("0.1");
        assertThat(new BigDecimal(0.1).toString()).startsWith(EXACT_DOUBLE_TENTH_PREFIX);
        assertThat(BigDecimal.valueOf(0.1)).hasToString("0.1");
    }

    @Test
    @DisplayName("M01 §2 · narrowing an integer keeps the low-order bits")
    void narrowingInt_keepsLowOrderBits() {
        int value = 200;

        assertThat((byte) value).isEqualTo((byte) -56);
    }

    @Test
    @DisplayName("M01 §2 · double to byte narrows through int, NaN becomes 0, large values saturate")
    void narrowingDouble_goesThroughIntFirst() {
        double value = 300.7;

        assertThat((byte) value).isEqualTo((byte) 44);
        assertThat((int) Double.NaN).isZero();
        assertThat((int) 1e20).isEqualTo(Integer.MAX_VALUE);
    }

    @Test
    @DisplayName("M01 §2 · char is an unsigned 16-bit integer")
    void charArithmetic_isIntArithmetic() {
        char letter = 'a';

        assertThat(letter + 1).isEqualTo(98);
        assertThat((char) (letter + 1)).isEqualTo('b');
        assertThat((int) Character.MAX_VALUE).isEqualTo(65_535);
    }

    @Test
    @DisplayName("M01 §2 · long plus float promotes to float")
    void longPlusFloat_isFloat() {
        Object sum = 1L + 1f;

        assertThat(sum).isInstanceOf(Float.class);
    }

    @Test
    @DisplayName("M01 §2 · int to float widening loses precision above 2^24")
    void intToFloat_losesPrecision() {
        int value = FLOAT_EXACT_LIMIT + 1;

        assertThat((float) value).isEqualTo((float) FLOAT_EXACT_LIMIT);
    }

    @Test
    @DisplayName("M01 §2 · compound assignment hides a narrowing cast")
    void compoundAssignment_castsBackToTheVariableType() {
        byte b = 10;

        b += 300;

        assertThat(b).isEqualTo((byte) 54);
    }

    @Test
    @DisplayName("M01 §2 · b = b + 1 on a byte does not compile")
    void plainAssignmentOfPromotedSum_doesNotCompile() {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(Map.of("ByteSum", BYTE_PLUS_ONE_SOURCE));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(INCOMPATIBLE_TYPES);
    }
}
