package dev.interview.javalanguage.m01.outputs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import dev.interview.javalanguage.m01.support.OutputCapture;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// The printed lines and the compile outcomes are the claims the guide makes, so the expected values stay literal.
class Q01OutputsTest {

    private static final String PUBLIC_CLASS_IN_WRONG_FILE = "compiler.err.class.public.should.be.in.file";
    private static final String LOSSY_CONVERSION_CODE = "compiler.err.prob.found.req";
    private static final String LOSSY_CONVERSION_TEXT = "possible lossy conversion from int to byte";
    private static final String ILLEGAL_START_OF_EXPRESSION = "compiler.err.illegal.start.of.expr";
    private static final String FOO = "Foo";
    private static final String TINY = "Tiny";
    private static final String TINY_SOURCE = "class Tiny {}";
    private static final String BYTES_BODY = "byte x = 10; byte y = 20; ";
    private static final String BOOLEANS_BODY = "boolean flag = true; boolean off = false; ";
    private static final String CLASS_VERSION_70 = "class file version 70.0";
    private static final String UP_TO_69 = "up to 69.0";
    private static final int MAJOR_VERSION_HIGH_BYTE_INDEX = 6;
    private static final int MAJOR_VERSION_LOW_BYTE_INDEX = 7;
    private static final byte MAJOR_VERSION_70 = 70;
    private static final int MONEY_SCALE = 2;
    private static final BigDecimal LINE = new BigDecimal("1.10");
    private static final BigDecimal RATE = new BigDecimal("0.05");
    private static final List<BigDecimal> THREE_LINES = List.of(LINE, LINE, LINE);

    @Test
    @DisplayName("Q01.02 · a public class must live in a file with its own name")
    void compile_reportsPublicClassInWrongFile_whenPublicClassNameDiffersFromFileName() {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(Map.of(FOO, "public class Bar {}"));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(PUBLIC_CLASS_IN_WRONG_FILE);
    }

    @Test
    @DisplayName("Q01.02 · a non-public class may have any name in the file")
    void compile_succeeds_whenNonPublicClassNameDiffersFromFileName() {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(Map.of(FOO, "class Bar {}"));

        assertThat(result.success()).isTrue();
    }

    @Test
    @DisplayName("Q01.03 · a class file newer than the JVM fails with UnsupportedClassVersionError")
    void defineClass_throwsUnsupportedClassVersionError_whenMajorVersionIs70() {
        InMemoryCompiler.Result compiled = InMemoryCompiler.compile(Map.of(TINY, TINY_SOURCE));
        assertThat(compiled.success()).isTrue();
        byte[] patched = compiled.classes().get(TINY).clone();
        patched[MAJOR_VERSION_HIGH_BYTE_INDEX] = 0;
        patched[MAJOR_VERSION_LOW_BYTE_INDEX] = MAJOR_VERSION_70;

        assertThatThrownBy(() -> new DefiningLoader().define(TINY, patched))
                .isInstanceOf(UnsupportedClassVersionError.class)
                .hasMessageContaining(CLASS_VERSION_70)
                .hasMessageContaining(UP_TO_69);
    }

    @Test
    @DisplayName("Q01.04 · int overflow, division, remainder and floating-point edge cases")
    void main_printsOverflowDivisionAndRemainderLines_whenQ01_04Runs() {
        List<String> lines = OutputCapture.linesOf(() -> Q01_04.main(new String[0]));

        assertThat(lines)
                .containsExactly(
                        "-2147483648", "-3", "-1", "1", "1", "1.5", "Infinity", "NaN", "-2147483648", "/ by zero");
    }

    @Test
    @DisplayName("Q01.04 · Integer.MIN_VALUE / -1 overflows without throwing")
    void minValueDividedByMinusOne_overflowsToMinValue_withoutThrowing() {
        int dividend = Integer.MIN_VALUE;
        int divisor = -1;

        int result = dividend / divisor;

        assertThat(result).isEqualTo(Integer.MIN_VALUE);
    }

    @Test
    @DisplayName("Q01.05 · casts, promotion and char arithmetic")
    void main_printsCastAndCharArithmeticLines_whenQ01_05Runs() {
        List<String> lines = OutputCapture.linesOf(() -> Q01_05.main(new String[0]));

        assertThat(lines)
                .containsExactly("-56", "3", "-3", "44", "0", "2147483647", "98", "b", "a1", "195", "b", "2.5");
    }

    @Test
    @DisplayName("Q01.05 · byte z = 10 + 20 compiles because the constant fits")
    void compile_succeeds_whenByteIsAssignedAConstantExpressionThatFits() {
        assertThat(compileInMethod("byte z = 10 + 20;").success()).isTrue();
    }

    @Test
    @DisplayName("Q01.05 · x += y compiles because compound assignment casts back")
    void compile_succeeds_whenByteCompoundAssignmentAddsAByte() {
        assertThat(compileInMethod(BYTES_BODY + "x += y;").success()).isTrue();
    }

    @Test
    @DisplayName("Q01.05 · byte z = x + y fails with a lossy conversion")
    void compile_reportsLossyConversion_whenByteIsAssignedTheSumOfTwoBytes() {
        InMemoryCompiler.Result result = compileInMethod(BYTES_BODY + "byte z = x + y;");

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).contains(LOSSY_CONVERSION_CODE);
        assertThat(result.diagnostics()).anyMatch(d -> d.getMessage(null).contains(LOSSY_CONVERSION_TEXT));
    }

    @Test
    @DisplayName("Q01.06 · tax rounded per line then summed, HALF_UP")
    void taxPerLine_returnsEighteenCents_whenThreeLinesAreRoundedHalfUp() {
        BigDecimal tax = Q01_06.taxPerLine(THREE_LINES, RATE, RoundingMode.HALF_UP);

        assertThat(tax.toPlainString()).isEqualTo("0.18");
    }

    @Test
    @DisplayName("Q01.06 · tax rounded once on the order total, HALF_UP")
    void taxPerOrder_returnsSeventeenCents_whenTotalIsRoundedHalfUp() {
        BigDecimal tax = Q01_06.taxPerOrder(THREE_LINES, RATE, RoundingMode.HALF_UP);

        assertThat(tax.toPlainString()).isEqualTo("0.17");
    }

    @Test
    @DisplayName("Q01.06 · tax rounded once on the order total, HALF_EVEN")
    void taxPerOrder_returnsSixteenCents_whenTotalIsRoundedHalfEven() {
        BigDecimal tax = Q01_06.taxPerOrder(THREE_LINES, RATE, RoundingMode.HALF_EVEN);

        assertThat(tax.toPlainString()).isEqualTo("0.16");
    }

    @Test
    @DisplayName("Q01.06 · a single line gives the same tax under both strategies")
    void taxPerLine_equalsTaxPerOrder_whenThereIsASingleLine() {
        List<BigDecimal> single = List.of(LINE);

        BigDecimal perLine = Q01_06.taxPerLine(single, RATE, RoundingMode.HALF_UP);
        BigDecimal perOrder = Q01_06.taxPerOrder(single, RATE, RoundingMode.HALF_UP);

        assertThat(perLine.toPlainString()).isEqualTo("0.06");
        assertThat(perOrder.toPlainString()).isEqualTo("0.06");
    }

    @Test
    @DisplayName("Q01.06 · no lines means no tax under both strategies")
    void taxPerLine_andTaxPerOrder_returnZero_whenThereAreNoLines() {
        List<BigDecimal> none = List.of();

        assertThat(Q01_06.taxPerLine(none, RATE, RoundingMode.HALF_UP)).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(Q01_06.taxPerOrder(none, RATE, RoundingMode.HALF_UP)).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Q01.06 · Math.round(1.005 * 100) is 100 because 1.005 is not exact in binary")
    void mathRound_returnsOneHundred_whenRoundingDoubleOnePointZeroZeroFiveTimesHundred() {
        long rounded = Math.round(1.005 * 100);

        assertThat(rounded).isEqualTo(100);
    }

    @Test
    @DisplayName("Q01.06 · BigDecimal(\"1.005\") rounds HALF_UP to 1.01")
    void setScale_returnsOnePointZeroOne_whenDecimalOnePointZeroZeroFiveIsRoundedHalfUp() {
        BigDecimal rounded = new BigDecimal("1.005").setScale(MONEY_SCALE, RoundingMode.HALF_UP);

        assertThat(rounded.toPlainString()).isEqualTo("1.01");
    }

    @Test
    @DisplayName("Q01.07 · evaluation order, short-circuit, precedence and ternary")
    void main_printsEvaluationOrderLines_whenQ01_07Runs() {
        List<String> lines = OutputCapture.linesOf(() -> Q01_07.main(new String[0]));

        assertThat(lines).containsExactly("7 12", "1", "32", "1 false false", "true", "big", "1.0");
    }

    @Test
    @DisplayName("Q01.07 · &&= is not an operator")
    void compile_reportsIllegalStartOfExpression_whenConditionalAndAssignmentIsUsed() {
        InMemoryCompiler.Result result = compileInMethod(BOOLEANS_BODY + "flag &&= off;");

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).first().isEqualTo(ILLEGAL_START_OF_EXPRESSION);
    }

    @Test
    @DisplayName("Q01.08 · shifts, distance masking and byte promotion")
    void main_printsShiftLines_whenQ01_08Runs() {
        List<String> lines = OutputCapture.linesOf(() -> Q01_08.main(new String[0]));

        assertThat(lines)
                .containsExactly("-4", "2147483644", "15", "1", "2", "4294967296", "-2147483648", "268435455", "-1");
    }

    @Test
    @DisplayName("Q01.08 · masking a byte before >>> gives the unsigned shift")
    void unsignedShift_givesFifteen_whenByteIsMaskedWith0xFFFirst() {
        byte small = -1;

        int shifted = (small & 0xFF) >>> 4;

        assertThat(shifted).isEqualTo(15);
    }

    @Test
    @DisplayName("Q01.08 · >> rounds toward negative infinity, / toward zero")
    void signedShift_roundsTowardNegativeInfinity_whileDivisionRoundsTowardZero() {
        int value = -7;

        assertThat(value >> 1).isEqualTo(-4);
        assertThat(value / 2).isEqualTo(-3);
    }

    private static InMemoryCompiler.Result compileInMethod(String statements) {
        String source = "class Snippet { void m() { " + statements + " } }";
        return InMemoryCompiler.compile(Map.of("Snippet", source));
    }

    private static final class DefiningLoader extends ClassLoader {

        Class<?> define(String name, byte[] bytes) {
            return defineClass(name, bytes, 0, bytes.length);
        }
    }
}
