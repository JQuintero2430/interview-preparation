package dev.interview.javalanguage.m01.s03;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Each test pins one JLS 25 rule from module 01 §3; the expressions under test are the claim, so they stay literal.
class OperatorBehaviourTest {

    private static final String EXPECTED = "compiler.err.expected";
    private static final String UNDERSCORE_READ = "compiler.err.use.of.underscore.not.allowed.non.variable";
    private static final String RESTRICTED_TYPE = "compiler.err.restricted.type.not.allowed";

    @Test
    @DisplayName("M01 §3 · >>> on a negative int is positive")
    void unsignedShift_fillsWithZeros_whileSignedShiftCopiesTheSignBit() {
        assertThat(-8 >>> 1).isEqualTo(2_147_483_644);
        assertThat(-8 >> 1).isEqualTo(-4);
    }

    @Test
    @DisplayName("M01 §3 · 1 << 32 == 1")
    void shiftDistance_isMaskedToFiveBitsForInt_andSixBitsForLong() {
        int distance = 32;
        assertThat(1 << distance).isEqualTo(1);
        assertThat(1 << (distance + 1)).isEqualTo(2);
        assertThat(1L << distance).isEqualTo(4_294_967_296L);
    }

    @Test
    @DisplayName("M01 §3 · && skips the right operand")
    void conditionalAnd_skipsTheRightOperand_whileLogicalAndEvaluatesIt() {
        AtomicInteger calls = new AtomicInteger();

        boolean shortCircuit = false && calls.incrementAndGet() > 0;
        assertThat(calls).hasValue(0);

        boolean bothSides = false & calls.incrementAndGet() > 0;
        assertThat(calls).hasValue(1);
        assertThat(shortCircuit || bothSides).isFalse();
    }

    @Test
    @DisplayName("M01 §3 · operands evaluate left to right")
    void leftOperand_isEvaluatedBeforeTheRightOperandAssigns() {
        int i = 1;
        int sum = i + (i = 5);
        assertThat(sum).isEqualTo(6);
        assertThat(i).isEqualTo(5);
    }

    @Test
    @DisplayName("M01 §3 · assignment is right-associative")
    void chainedAssignment_assignsRightToLeft() {
        int a;
        int b;
        a = b = 3;
        assertThat(a).isEqualTo(3);
        assertThat(b).isEqualTo(3);
    }

    @Test
    @DisplayName("M01 §3 · conditional with int and double operands is double")
    void numericConditional_promotesBothBranches() {
        Object result = true ? 1 : 2.0;
        assertThat(result).isEqualTo(1.0);
    }

    @Test
    @DisplayName("M01 §3 · labeled break leaves the outer loop")
    void labeledBreak_exitsBothLoops() {
        int[][] grid = {{1, 2}, {3, 42}, {5, 6}};
        int visited = 0;
        search:
        for (int[] row : grid) {
            for (int cell : row) {
                visited++;
                if (cell == 42) {
                    break search;
                }
            }
        }
        assertThat(visited).isEqualTo(4);
    }

    @Test
    @DisplayName("M01 §3 · switch statement falls through without break")
    void switchStatement_fallsThroughToTheNextGroup_withoutBreak() {
        assertThat(stepsAfter("draft")).containsExactly("validate", "publish");
        assertThat(stepsAfter("validated")).containsExactly("publish");
    }

    @Test
    @DisplayName("M01 §3 · contextual keywords and Unicode letters are identifiers")
    void contextualKeywords_compileAsLocalNames_butVarIsNotATypeName() {
        for (String name : List.of("var", "record", "yield", "sizeof", "café")) {
            String source = "class Names { void m() { int " + name + " = 1; } }";
            assertThat(InMemoryCompiler.compile(Map.of("Names", source)).success())
                    .as(name)
                    .isTrue();
        }
        InMemoryCompiler.Result varType = InMemoryCompiler.compile(Map.of("var", "class var {}"));
        assertThat(varType.errorCodes()).contains(RESTRICTED_TYPE);
    }

    @Test
    @DisplayName("M01 §3 · reserved words and literals are not identifiers")
    void reservedKeywordsAndLiterals_failAsLocalNames() {
        for (String name : List.of("goto", "const", "null", "true")) {
            String source = "class Names { void m() { int " + name + " = 1; } }";
            InMemoryCompiler.Result result = InMemoryCompiler.compile(Map.of("Names", source));
            assertThat(result.success()).as(name).isFalse();
            assertThat(result.errorCodes()).as(name).contains(EXPECTED);
        }
    }

    @Test
    @DisplayName("M01 §3 · _ as an identifier is an error")
    void underscore_declaresAnUnnamedVariable_butCannotBeRead() {
        String declareOnly = "class U { void m() { int _ = 1; } }";
        String read = "class U { int m() { int _ = 1; return _; } }";

        assertThat(InMemoryCompiler.compile(Map.of("U", declareOnly)).success()).isTrue();
        assertThat(InMemoryCompiler.compile(Map.of("U", read)).errorCodes()).containsExactly(UNDERSCORE_READ);
    }

    private static List<String> stepsAfter(String state) {
        List<String> steps = new ArrayList<>();
        switch (state) {
            case "draft":
                steps.add("validate");
            case "validated":
                steps.add("publish");
                break;
            default:
                steps.add("none");
        }
        return steps;
    }
}
