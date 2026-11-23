package dev.interview.javalanguage.m05.outputs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalStateException;
import static org.assertj.core.api.Assertions.assertThatNullPointerException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.entry;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import dev.interview.javalanguage.m01.support.OutputCapture;
import dev.interview.javalanguage.m05.s05.Employee;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// The printed lines and diagnostic keys are the claims the guide makes, so the expected values stay literal.
class Q05OutputsTest {

    private static final List<Employee> STAFF = List.of(
            new Employee("ann", "search", 120), new Employee("bo", "search", 80), new Employee("cy", "ops", 90));

    private static final String SOURCE_NAME = "Probe";
    private static final String INCOMPATIBLE_TYPES = "compiler.err.prob.found.req";
    private static final String CANNOT_INFER_VAR = "compiler.err.cant.infer.local.var.type";

    private static final String INHERITED_ABSTRACT_METHODS = """
            interface X { int m(Iterable<String> arg); }
            interface Y { int m(Iterable<String> arg); }
            interface Z extends X, Y {}
            interface Task extends Runnable {}
            class Probe { Z z = values -> 1; Task task = () -> {}; }
            """;
    private static final String VAR_WITH_UNTYPED_LAMBDA = """
            class Probe { void run() { var f = x -> x; } }
            """;
    private static final String CAST_SUPPLIES_TARGET = """
            class Probe { void run() { Object task = (Runnable) () -> {}; } }
            """;
    private static final String ANONYMOUS_CLASSES = """
            class Probe {
                int count = 1;
                Runnable ignoresOuter() { return new Runnable() { public void run() {} }; }
                Runnable readsOuter() { return new Runnable() { public void run() { count++; } }; }
            }
            """;
    private static final String ABSTRACT_CLASS_TARGET = """
            abstract class Job { abstract void run(); }
            class Probe { Job job = () -> {}; }
            """;

    @Test
    @DisplayName("Q05.01 · an interface that inherits one abstract method, even from two parents, is functional")
    void q05_01_inheritedSingleAbstractMethodIsFunctional() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, INHERITED_ABSTRACT_METHODS));

        assertThat(result.success()).isTrue();
    }

    @Test
    @DisplayName("Q05.02 · var f = x -> x fails with compiler.err.cant.infer.local.var.type")
    void q05_02_varGivesNoTargetType() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, VAR_WITH_UNTYPED_LAMBDA));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(CANNOT_INFER_VAR);
    }

    @Test
    @DisplayName("Q05.02 · a cast to Runnable supplies the target type an Object variable cannot")
    void q05_02_castSuppliesTargetType() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, CAST_SUPPLIES_TARGET));

        assertThat(result.success()).isTrue();
    }

    @Test
    @DisplayName("Q05.03 · a lambda cannot implement an abstract class, even one with a single abstract method")
    void q05_03_abstractClassIsNotATarget() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, ABSTRACT_CLASS_TARGET));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(INCOMPATIBLE_TYPES);
    }

    @Test
    @DisplayName(
            "Q05.03 · javac 25 gives an anonymous class a this$ field only when its body uses the enclosing instance")
    void q05_03_enclosingInstanceFieldOnlyWhenUsed() throws ClassNotFoundException {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, ANONYMOUS_CLASSES));

        assertThat(result.success()).isTrue();
        assertThat(enclosingInstanceFields(result.load("Probe$1"))).isEmpty();
        assertThat(enclosingInstanceFields(result.load("Probe$2"))).hasSize(1);
    }

    @Test
    @DisplayName(
            "Q05.04 · andThen, compose, negate, Predicate.not and an or-then-and chain print 12, 11, 22, false, true, false")
    void q05_04_printsComposedResults() {
        List<String> lines = OutputCapture.linesOf(() -> Q05_04.main(new String[0]));

        assertThat(lines).containsExactly("12", "11", "22", "false", "true", "false");
    }

    @Test
    @DisplayName("Q05.04 · andThen(null) throws NullPointerException when composing, not when applying")
    void q05_04_nullStepFailsAtComposition() {
        Function<Integer, Integer> plusOne = x -> x + 1;

        assertThatNullPointerException().isThrownBy(() -> plusOne.andThen(null));
    }

    @Test
    @DisplayName(
            "Q05.06 · loaders built over a one-element array all return 3; the per-iteration local returns 0, 1, 2")
    void q05_06_sharedHolderVersusFreshLocal() {
        assertThat(Q05_06.run(Q05_06.pageLoadersBuggy(3))).containsExactly(3, 3, 3);
        assertThat(Q05_06.run(Q05_06.pageLoadersFixed(3))).containsExactly(0, 1, 2);
    }

    @Test
    @DisplayName("Q05.06 · an AtomicInteger holder has the same bug: every loader returns 3")
    void q05_06_atomicHolderSharesTheCounterToo() {
        assertThat(Q05_06.run(Q05_06.pageLoadersAtomic(3))).containsExactly(3, 3, 3);
    }

    @Test
    @DisplayName("Q05.08 · the lambda is created and throws when called; the bound reference throws when created")
    void q05_08_printsWhereEachFormThrows() {
        List<String> lines = OutputCapture.linesOf(() -> Q05_08.main(new String[0]));

        assertThat(lines).containsExactly("1: lambda created", "2: lambda call threw", "3: reference creation threw");
    }

    @Test
    @DisplayName("Q05.08 · the reference's NullPointerException comes from Objects.requireNonNull and has no message")
    void q05_08_referenceFailsInRequireNonNull() {
        NullPointerException failure = Q05_08.referenceCreationFailure(null);

        assertThat(failure).isNotNull();
        assertThat(failure.getMessage()).isNull();
        assertThat(failure.getStackTrace()[0].getClassName()).isEqualTo("java.util.Objects");
        assertThat(failure.getStackTrace()[0].getMethodName()).isEqualTo("requireNonNull");
        assertThat(failure.getStackTrace()[1].getMethodName()).isEqualTo("referenceCreationFailure");
    }

    @Test
    @DisplayName("Q05.08 · the lambda's NullPointerException is raised in the lambda body and names the null variable")
    void q05_08_lambdaFailsInsideBody() {
        NullPointerException failure = Q05_08.lambdaCallFailure(null);

        assertThat(failure).isNotNull();
        assertThat(failure.getStackTrace()[0].getMethodName()).startsWith("lambda$");
        assertThat(failure.getMessage()).contains("\"holder\" is null");
    }

    @Test
    @DisplayName("Q05.08 · an unbound Holder::get is created without a receiver and throws when applied to null")
    void q05_08_unboundReferenceFailsAtCall() {
        Function<Q05_08.Holder, String> unbound = Q05_08.Holder::get;

        assertThat(unbound.apply(new Q05_08.Holder("ready"))).isEqualTo("ready");
        assertThatNullPointerException().isThrownBy(() -> unbound.apply(null));
    }

    @Test
    @DisplayName(
            "Q05.10 · nothing runs before toList; then each element goes through peek, filter and map before the next")
    void q05_10_printsVerticalExecution() {
        List<String> lines = OutputCapture.linesOf(() -> Q05_10.main(new String[0]));

        assertThat(lines)
                .containsExactly(
                        "built",
                        "peek a",
                        "filter a",
                        "peek bb",
                        "filter bb",
                        "map bb",
                        "peek ccc",
                        "filter ccc",
                        "map ccc",
                        "result [BB, CCC]");
    }

    @Test
    @DisplayName("Q05.11 · findFirst reads 5, filter-then-limit reads 6, takeWhile reads 7, limit-then-filter reads 3")
    void q05_11_printsHowMuchOfTheSourceIsRead() {
        List<String> lines = OutputCapture.linesOf(() -> Q05_11.main(new String[0]));

        assertThat(lines)
                .containsExactly("5 after 5", "[2, 4, 6] after 6", "[1, 2, 4, 8, 16, 32] after 7", "[2] after 3");
    }

    @Test
    @DisplayName("Q05.12 · the second terminal operation on one stream throws IllegalStateException")
    void q05_12_reuseThrows() {
        List<String> lines = List.of("INFO start", "ERROR disk full", "ERROR timeout");

        assertThatIllegalStateException()
                .isThrownBy(() -> Q05_12.errorSummaryBuggy(lines))
                .withMessage("stream has already been operated upon or closed");
    }

    @Test
    @DisplayName("Q05.12 · collecting once, or a Supplier of fresh streams, answers both questions")
    void q05_12_fixesAnswerBothQuestions() {
        List<String> lines = List.of("INFO start", "ERROR disk full", "ERROR timeout");

        assertThat(Q05_12.errorSummary(lines)).isEqualTo("2 errors, first: ERROR disk full");
        assertThat(Q05_12.errorSummaryFromSupplier(() -> lines.stream().filter(line -> line.startsWith("ERROR"))))
                .isEqualTo("2 errors, first: ERROR disk full");
        assertThat(Q05_12.errorSummary(List.of("INFO start"))).isEqualTo("0 errors, first: none");
    }

    @Test
    @DisplayName("Q05.13 · sorted with a comparator is stable on an ordered stream: equal keys keep encounter order")
    void q05_13_sortedIsStableOnOrderedStreams() {
        List<String> sorted = Stream.of("pear", "fig", "plum", "kiwi")
                .sorted(Comparator.comparingInt(String::length))
                .toList();

        assertThat(sorted).containsExactly("fig", "pear", "plum", "kiwi");
    }

    @Test
    @DisplayName(
            "Q05.14 · duplicate key message, merge by sum, keep last, and NullPointerException from both toMap paths")
    void q05_14_printsToMapOutcomes() {
        List<String> lines = OutputCapture.linesOf(() -> Q05_14.main(new String[0]));

        assertThat(lines)
                .containsExactly(
                        "Duplicate key a (attempted merging values apple and avocado)",
                        "{a=2, b=1}",
                        "{a=avocado, b=banana}",
                        "toMap: NullPointerException",
                        "toMap with merge: NullPointerException");
    }

    @Test
    @DisplayName("Q05.15 · a filtering downstream keeps a team with no match as 0; filtering first drops the team")
    void q05_15_filteringVersusFilter() {
        assertThat(Q05_15.highEarnersPerTeam(STAFF, 100)).containsExactly(entry("ops", 0L), entry("search", 1L));
        assertThat(Q05_15.highEarnersPerTeamFilteredFirst(STAFF, 100)).containsExactly(entry("search", 1L));
    }

    @Test
    @DisplayName("Q05.15 · groupingBy with a partitioningBy downstream gives every team both bands")
    void q05_15_nestedGroupingHasBothBands() {
        Map<String, Map<Boolean, List<String>>> bands = Q05_15.namesByTeamAndBand(STAFF, 100);

        assertThat(bands.get("ops")).containsEntry(true, List.of()).containsEntry(false, List.of("cy"));
        assertThat(bands.get("search")).containsEntry(true, List.of("ann")).containsEntry(false, List.of("bo"));
    }

    @Test
    @DisplayName(
            "Q05.16 · the honest collector's result rejects add; with a false IDENTITY_FINISH the finisher never runs")
    void q05_16_falseIdentityFinishSkipsTheFinisher() {
        List<String> honest = Stream.of("a", "b").collect(Q05_16.toReadOnlyList());
        List<String> skipped = Stream.of("a", "b").collect(Q05_16.toReadOnlyListFalselyIdentity());

        assertThatThrownBy(() -> honest.add("c")).isInstanceOf(UnsupportedOperationException.class);
        assertThat(skipped).isInstanceOf(ArrayList.class);
        skipped.add("c");
        assertThat(skipped).containsExactly("a", "b", "c");
    }

    @Test
    @DisplayName("Q05.16 · the honest collector gives the same result sequentially and in parallel")
    void q05_16_honestCollectorIsParallelSafe() {
        List<Integer> source = IntStream.range(0, 2_000).boxed().toList();

        assertThat(source.parallelStream().collect(Q05_16.toReadOnlyList())).isEqualTo(source);
        assertThat(source.stream().collect(Q05_16.toReadOnlyList())).isEqualTo(source);
    }

    private static List<String> enclosingInstanceFields(Class<?> type) {
        return Arrays.stream(type.getDeclaredFields())
                .map(Field::getName)
                .filter(name -> name.startsWith("this$"))
                .toList();
    }
}
