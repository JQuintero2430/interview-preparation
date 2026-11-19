package dev.interview.javalanguage.m02.outputs;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import dev.interview.javalanguage.m01.support.OutputCapture;
import dev.interview.javalanguage.m02.s04.Job;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// The printed lines and the compile outcomes are the claims the guide makes, so the expected values stay literal.
class Q02OutputsTest {

    private static final String DOES_NOT_OVERRIDE = "compiler.err.method.does.not.override.superclass";
    private static final String OVERRIDDEN_OVERLOAD_SOURCE = """
            final class Pt {
                private final int x;
                Pt(int x) { this.x = x; }
                @Override
                public boolean equals(Pt other) { return x == other.x; }
            }
            """;
    private static final List<String> Q02_05_DISTINCT_HASHES = List.of("true false", "2", "null");
    private static final List<String> Q02_05_COLLIDING_HASHES = List.of("true true", "1", "first");
    private static final int AA_BB_HASH = 2112;

    @Test
    @DisplayName("Q02.01 · enum constants are equal exactly when they are the same instance")
    void enumEquals_agreesWithIdentity_whenComparingConstants() {
        DayOfWeek parsed = DayOfWeek.valueOf("MONDAY");

        assertThat(parsed == DayOfWeek.MONDAY).isTrue();
        assertThat(parsed.equals(DayOfWeek.MONDAY)).isTrue();
        assertThat(parsed.equals(DayOfWeek.TUESDAY)).isFalse();
    }

    @Test
    @DisplayName("Q02.01 · NaN is not == to itself, but Double.equals says it is equal")
    void nanComparison_differs_betweenOperatorAndDoubleEquals() {
        double nan = Double.NaN;

        assertThat(nan == nan).isFalse();
        assertThat(Double.valueOf(nan).equals(Double.valueOf(nan))).isTrue();
    }

    @Test
    @DisplayName("Q02.01 · 0.0 == -0.0, but Double.equals says they differ")
    void signedZeroComparison_differs_betweenOperatorAndDoubleEquals() {
        double zero = 0.0;
        double negativeZero = -0.0;

        assertThat(zero == negativeZero).isTrue();
        assertThat(Double.valueOf(zero).equals(Double.valueOf(negativeZero))).isFalse();
    }

    @Test
    @DisplayName("Q02.03 · the overload answers true, every Object-typed caller answers false")
    void main_printsTrueThenThreeFalse_whenEqualsIsOverloaded() {
        List<String> lines = OutputCapture.linesOf(() -> Q02_03.main(new String[0]));

        assertThat(lines).containsExactly("true", "false", "false", "false");
    }

    @Test
    @DisplayName("Q02.03 · @Override on equals(Pt) does not compile")
    void compile_reportsDoesNotOverride_whenOverrideAnnotatesEqualsOverload() {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(Map.of("Pt", OVERRIDDEN_OVERLOAD_SOURCE));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(DOES_NOT_OVERRIDE);
    }

    @Test
    @DisplayName("Q02.04 · \"Aa\" and \"BB\" are unequal strings with the same hash code")
    void stringHashCode_collides_forAaAndBb() {
        assertThat("Aa").isNotEqualTo("BB");
        assertThat("Aa".hashCode()).isEqualTo(AA_BB_HASH);
        assertThat("BB".hashCode()).isEqualTo(AA_BB_HASH);
    }

    @Test
    @DisplayName("Q02.05 · equal points without hashCode: two elements and a miss, unless identity hashes collide")
    void main_printsOneOfThePermittedOutcomes_whenHashCodeIsMissing() {
        List<String> lines = OutputCapture.linesOf(() -> Q02_05.main(new String[0]));

        assertThat(lines).isIn(Q02_05_DISTINCT_HASHES, Q02_05_COLLIDING_HASHES);
    }

    @Test
    @DisplayName("Q02.06 · a mutated key: both lookups miss, the entry and its value stay")
    void main_printsTwoNullsThenSizeAndValue_whenKeyIsMutatedAfterPut() {
        List<String> lines = OutputCapture.linesOf(() -> Q02_06.main(new String[0]));

        assertThat(lines).containsExactly("null", "null", "1", "true");
    }

    @Test
    @DisplayName("Q02.09 · instanceof equals answers one way only, getClass equals rejects the subclass both ways")
    void main_printsTrueThenThreeFalse_whenSubclassMeetsInstanceofAndGetClassEquals() {
        List<String> lines = OutputCapture.linesOf(() -> Q02_09.main(new String[0]));

        assertThat(lines).containsExactly("true", "false", "false", "false");
    }

    @Test
    @DisplayName("Q02.12 · 1.0 and 1.00 are unequal but compare as 0: HashSet size 2, TreeSet size 1")
    void main_printsFalseZeroTwoOne_whenBigDecimalsDifferOnlyInScale() {
        List<String> lines = OutputCapture.linesOf(() -> Q02_12.main(new String[0]));

        assertThat(lines).containsExactly("false", "0", "2", "1");
    }

    @Test
    @DisplayName("Q02.12 · stripTrailingZeros makes 1.0 and 1.00 equal with equal hash codes")
    void stripTrailingZeros_makesValuesEqual_whenOnlyScaleDiffers() {
        BigDecimal oneDecimal = new BigDecimal("1.0").stripTrailingZeros();
        BigDecimal twoDecimals = new BigDecimal("1.00").stripTrailingZeros();

        assertThat(oneDecimal.equals(twoDecimals)).isTrue();
        assertThat(oneDecimal.hashCode()).isEqualTo(twoDecimals.hashCode());
    }

    @Test
    @DisplayName("Q02.13 · the subtraction comparator sorts Integer.MIN_VALUE after 1, comparingInt sorts it first")
    void sort_putsMinValueLast_whenComparatorSubtracts() {
        Job low = new Job("low", Integer.MIN_VALUE);
        Job high = new Job("high", 1);
        List<Job> bySubtraction = new ArrayList<>(List.of(low, high));
        List<Job> byComparingInt = new ArrayList<>(List.of(low, high));

        bySubtraction.sort(Job.BY_PRIORITY_SUBTRACTION);
        byComparingInt.sort(Job.BY_PRIORITY);

        assertThat(bySubtraction).extracting(Job::name).containsExactly("high", "low");
        assertThat(byComparingInt).extracting(Job::name).containsExactly("low", "high");
    }

    @Test
    @DisplayName("Q02.14 · a TreeMap by name keeps two entries and gives the first Ana the second Ana's total")
    void main_printsTwoEntriesWithOverwrittenTotal_whenComparatorTiesOnName() {
        List<String> lines = OutputCapture.linesOf(() -> Q02_14.main(new String[0]));

        assertThat(lines).containsExactly("2", "1 250", "3 40");
    }

    @Test
    @DisplayName("Q02.16 · the unmodifiable view shows the later add, List.copyOf does not, and the view rejects add")
    void main_printsGrownViewAndFixedCopy_whenSourceChangesAfterWrapping() {
        List<String> lines = OutputCapture.linesOf(() -> Q02_16.main(new String[0]));

        assertThat(lines).containsExactly("[EUR, USD, XXX]", "[EUR, USD]", "view rejects add");
    }

    @Test
    @DisplayName("Q02.19 · a record with a byte[] component never deduplicates, the Event fix does")
    void main_printsTwoAddsThenOneRejected_whenRecordComparesArrayByReference() {
        List<String> lines = OutputCapture.linesOf(() -> Q02_19.main(new String[0]));

        assertThat(lines).containsExactly("true", "true", "2", "true", "false", "1");
    }
}
