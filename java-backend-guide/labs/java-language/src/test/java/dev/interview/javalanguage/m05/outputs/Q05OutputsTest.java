package dev.interview.javalanguage.m05.outputs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalStateException;
import static org.assertj.core.api.Assertions.assertThatNullPointerException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.entry;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import dev.interview.javalanguage.m01.support.OutputCapture;
import dev.interview.javalanguage.m05.s05.Employee;
import java.io.IOException;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Gatherers;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

// The printed lines and diagnostic keys are the claims the guide makes, so the expected values stay literal.
class Q05OutputsTest {

    @TempDir
    Path dir;

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
    private static final String CANNOT_APPLY = "compiler.err.cant.apply.symbol";
    private static final String INT_STREAM_COLLECTOR = """
            import java.util.stream.*;
            class Probe { Object run() { return IntStream.range(0, 3).collect(Collectors.toList()); } }
            """;
    private static final String BOXED_COLLECTOR = """
            import java.util.stream.*;
            class Probe { Object run() { return IntStream.range(0, 3).boxed().collect(Collectors.toList()); } }
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

    @RepeatedTest(10)
    @DisplayName("Q05.17 · an immutable reduce into a list is correct in parallel; collect is too")
    void q05_17_immutableReduceAndCollectAgree() {
        List<Integer> source = IntStream.range(0, 1_000).boxed().toList();

        assertThat(Q05_17.listByImmutableReduce(source.parallelStream())).isEqualTo(source);
        assertThat(Q05_17.listByImmutableReduce(source.stream())).isEqualTo(source);
        assertThat(Q05_17.listByCollect(source.parallelStream())).isEqualTo(source);
    }

    @Test
    @DisplayName("Q05.17 · reduce without an identity returns an Optional, empty for an empty stream")
    void q05_17_reduceWithoutIdentityIsOptional() {
        assertThat(Stream.of(3, 4).reduce(Integer::sum)).contains(7);
        assertThat(Stream.<Integer>empty().reduce(Integer::sum)).isEmpty();
    }

    @RepeatedTest(20)
    @DisplayName("Q05.18 · the fee as identity is added k times in parallel, 2 <= k <= 100; the fix adds it once")
    void q05_18_feeAddedOncePerChunk() {
        List<Integer> amounts =
                new ArrayList<>(IntStream.rangeClosed(1, 100).boxed().toList());
        int fee = 10;

        int buggy = Q05_18.totalWithFeeBuggy(amounts, fee);
        int extra = buggy - 5050;

        assertThat(extra % fee).isZero();
        assertThat(extra / fee).isBetween(2, 100);
        assertThat(Q05_18.totalWithFee(amounts, fee)).isEqualTo(5060);
        assertThat(amounts.stream().reduce(fee, Integer::sum)).isEqualTo(5060);
    }

    @Test
    @DisplayName("Q05.19 · summingInt overflows like IntStream.sum; averagingInt of nothing is 0.0, average() is empty")
    void q05_19_collectorArithmetic() {
        List<Integer> values = List.of(Integer.MAX_VALUE, 1);

        assertThat(values.stream().collect(Collectors.summingInt(Integer::intValue)))
                .isEqualTo(Integer.MIN_VALUE);
        assertThat(values.stream().collect(Collectors.summingLong(Integer::longValue)))
                .isEqualTo(2_147_483_648L);
        assertThat(Stream.<Integer>empty().collect(Collectors.averagingInt(Integer::intValue)))
                .isEqualTo(0.0);
        assertThat(IntStream.empty().average()).isEmpty();
    }

    @Test
    @DisplayName("Q05.19 · IntStream has no collect(Collector): it needs boxed() first")
    void q05_19_intStreamNeedsBoxedForCollectors() {
        var withoutBoxed = InMemoryCompiler.compile(Map.of(SOURCE_NAME, INT_STREAM_COLLECTOR));
        var withBoxed = InMemoryCompiler.compile(Map.of(SOURCE_NAME, BOXED_COLLECTOR));

        assertThat(withoutBoxed.success()).isFalse();
        assertThat(withoutBoxed.errorCodes()).contains(CANNOT_APPLY);
        assertThat(withBoxed.success()).isTrue();
    }

    @Test
    @DisplayName("Q05.20 · flatMap(Optional::stream) keeps the present values; a null mapped stream counts as empty")
    void q05_20_flatMapOptionalsAndNull() {
        List<Integer> present = Stream.of(Optional.of(1), Optional.<Integer>empty(), Optional.of(3))
                .flatMap(Optional::stream)
                .toList();
        List<String> withNull = Stream.of("a", "b")
                .flatMap(s -> s.equals("a") ? null : Stream.of(s))
                .toList();

        assertThat(present).containsExactly(1, 3);
        assertThat(withNull).containsExactly("b");
    }

    @Test
    @DisplayName("Q05.22 · windowFixed(2), windowSliding(2) and scan over 1..5")
    void q05_22_printsWindowsAndScan() {
        List<String> lines = OutputCapture.linesOf(() -> Q05_22.main(new String[0]));

        assertThat(lines)
                .containsExactly("[[1, 2], [3, 4], [5]]", "[[1, 2], [2, 3], [3, 4], [4, 5]]", "[1, 3, 6, 10, 15]");
    }

    @Test
    @DisplayName("Q05.22 · fold gives one element; a sliding window longer than the stream gives one short window")
    void q05_22_foldAndLongSlidingWindow() {
        List<Integer> source = List.of(1, 2, 3, 4, 5);

        assertThat(source.stream().gather(Gatherers.fold(() -> 0, Integer::sum)).toList())
                .containsExactly(15);
        assertThat(source.stream().gather(Gatherers.windowSliding(6)).toList()).containsExactly(List.of(1, 2, 3, 4, 5));
    }

    @RepeatedTest(5)
    @DisplayName("Q05.23 · a spliterator that never splits runs a parallel stream on the calling thread only")
    void q05_23_nonSplittingSourceStaysOnCaller() {
        List<Integer> source = IntStream.range(0, 10_000).boxed().toList();

        Set<Thread> threads = Q05_23.threadsUsed(Q05_23.nonSplitting(source));

        assertThat(threads).containsExactly(Thread.currentThread());
    }

    @RepeatedTest(5)
    @DisplayName("Q05.23 · the same source with its own spliterator includes the calling thread among the workers")
    void q05_23_splittingSourceIncludesCaller() {
        List<Integer> source =
                new ArrayList<>(IntStream.range(0, 10_000).boxed().toList());

        Set<Thread> threads = Q05_23.threadsUsed(source.spliterator());

        assertThat(threads).contains(Thread.currentThread());
    }

    @RepeatedTest(10)
    @DisplayName("Q05.24 · ordered parallel limit keeps the first n; unordered limit gives some n distinct elements")
    void q05_24_limitWithAndWithoutOrder() {
        int[] ordered = IntStream.range(0, 100_000).parallel().limit(5).toArray();
        int[] unordered =
                IntStream.range(0, 100_000).parallel().unordered().limit(5).toArray();

        assertThat(ordered).containsExactly(0, 1, 2, 3, 4);
        assertThat(unordered).hasSize(5).doesNotHaveDuplicates();
        assertThat(IntStream.of(unordered).allMatch(n -> n >= 0 && n < 100_000)).isTrue();
    }

    @RepeatedTest(5)
    @DisplayName("Q05.24 · no thread that runs a parallel stream's lambda is a virtual thread")
    void q05_24_parallelStreamThreadsAreNotVirtual() {
        Set<Thread> threads = Q05_23.threadsUsed(
                new ArrayList<>(IntStream.range(0, 10_000).boxed().toList()).spliterator());

        assertThat(threads).isNotEmpty().noneMatch(Thread::isVirtual);
    }

    @Test
    @DisplayName("Q05.27 · the swallowing import reports success for a missing file; the Result version reports it")
    void q05_27_swallowedFailureVersusReportedFailure() throws IOException {
        Path threeRecords = Files.writeString(dir.resolve("a.csv"), "1\n2\n3\n");
        Path twoRecords = Files.writeString(dir.resolve("b.csv"), "4\n5\n");
        Path missing = dir.resolve("missing.csv");
        List<Path> files = List.of(threeRecords, missing, twoRecords);

        Q05_27.ImportReport swallowed = Q05_27.importSwallowing(files);
        Q05_27.ImportReport reported = Q05_27.importReporting(files);

        assertThat(swallowed).isEqualTo(new Q05_27.ImportReport(3, 5, List.of()));
        assertThat(swallowed.succeeded()).isTrue();
        assertThat(reported).isEqualTo(new Q05_27.ImportReport(3, 5, List.of(missing)));
        assertThat(reported.succeeded()).isFalse();
    }

    @Test
    @DisplayName("Q05.29 · orElse runs its argument even when present; orElseGet only when empty: 3 calls in all")
    void q05_29_printsWhenLoadDefaultRuns() {
        List<String> lines = OutputCapture.linesOf(() -> Q05_29.main(new String[0]));

        assertThat(lines)
                .containsExactly(
                        "loadDefault #1",
                        "cached",
                        "cached",
                        "loadDefault #2",
                        "default",
                        "loadDefault #3",
                        "default",
                        "calls 3");
    }

    @Test
    @DisplayName("Q05.30 · get() on a missing plan throws NoSuchElementException: No value present")
    void q05_30_getThrowsWithoutContext() {
        Q05_30 billing = new Q05_30(Map.of("acme", new Q05_30.Plan("acme", 25)));

        assertThat(billing.seatsBuggy("acme")).isEqualTo(25);
        assertThatThrownBy(() -> billing.seatsBuggy("newco"))
                .isExactlyInstanceOf(NoSuchElementException.class)
                .hasMessage("No value present");
    }

    @Test
    @DisplayName("Q05.30 · orElseThrow with a supplier names the tenant; orElse applies the free tier")
    void q05_30_fixesNameTheTenantOrDecide() {
        Q05_30 billing = new Q05_30(Map.of("acme", new Q05_30.Plan("acme", 25)));

        assertThatThrownBy(() -> billing.seats("newco"))
                .isInstanceOf(Q05_30.PlanNotFoundException.class)
                .hasMessage("no billing plan for tenant newco");
        assertThat(billing.seats("acme")).isEqualTo(25);
        assertThat(billing.seatsOrFreeTier("newco")).isEqualTo(1);
    }

    private static List<String> enclosingInstanceFields(Class<?> type) {
        return Arrays.stream(type.getDeclaredFields())
                .map(Field::getName)
                .filter(name -> name.startsWith("this$"))
                .toList();
    }
}
