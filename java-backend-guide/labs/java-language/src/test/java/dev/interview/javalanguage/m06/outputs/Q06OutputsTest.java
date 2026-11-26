package dev.interview.javalanguage.m06.outputs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.catchThrowable;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import dev.interview.javalanguage.m01.support.OutputCapture;
import dev.interview.javalanguage.m06.s05.PoolThreads;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.UncheckedIOException;
import java.nio.file.AccessDeniedException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// The printed lines and diagnostic keys are the claims the guide makes, so the expected values stay literal.
class Q06OutputsTest {

    private static final IllegalStateException NIGHTLY_FAILURE = new IllegalStateException("nightly job failed");
    private static final String SOURCE_NAME = "Probe";
    private static final String ALREADY_CAUGHT = "compiler.err.except.already.caught";
    private static final String NEVER_THROWN = "compiler.err.except.never.thrown.in.try";
    private static final String UNREACHABLE = "compiler.err.unreachable.stmt";
    private static final String UNREPORTED = "compiler.err.unreported.exception.need.to.catch.or.throw";
    private static final String INCOMPATIBLE_TYPES = "compiler.err.prob.found.req";
    private static final String ABSTRACT_INSTANTIATED = "compiler.err.abstract.cant.be.instantiated";

    private static final String NEW_ON_ABSTRACT_CLASS = """
            abstract class Shape { public Shape() {} }
            class Probe { Shape shape = new Shape(); }
            """;
    private static final String REFLECTION_ON_ABSTRACT_CLASS = """
            public abstract class Probe { public Probe() {} }
            """;

    private static final String SNIPPET_A_CATCH_ORDER = """
            import java.io.*;
            class Probe {
                void load(File file) throws IOException { new FileReader(file).close(); }
                void run(File file) {
                    try { load(file); }
                    catch (Exception e) { System.out.println("failed"); }
                    catch (IOException e) { System.out.println("I/O"); }
                }
            }
            """;
    private static final String SNIPPET_B_UNTHROWN_CHECKED = """
            import java.util.*;
            class Probe {
                void run(List<String> names) {
                    try { names.add("ann"); }
                    catch (InterruptedException e) { Thread.currentThread().interrupt(); }
                }
            }
            """;
    private static final String SNIPPET_C_AFTER_THROW = """
            class Probe {
                int parse(String text) {
                    if (text.isBlank()) {
                        throw new IllegalArgumentException("blank");
                        return -1;
                    }
                    return Integer.parseInt(text);
                }
            }
            """;
    private static final String SNIPPET_D_STATEMENT_BETWEEN = """
            class Probe {
                void run() {
                    try { System.out.println("work"); }
                    System.out.println("between");
                    catch (RuntimeException e) { }
                }
            }
            """;
    private static final String SNIPPET_E_NESTED = """
            import java.io.IOException;
            public class Probe {
                void read() throws IOException { throw new IOException("disk"); }
                public String run() {
                    StringBuilder events = new StringBuilder();
                    try {
                        try { read(); }
                        finally { events.append("inner finally, "); }
                    } catch (IOException e) {
                        events.append("outer caught ").append(e.getMessage());
                    }
                    return events.toString();
                }
            }
            """;

    private static final String MULTI_CATCH_RETHROW_DECLARES_BOTH = """
            import java.io.IOException;
            class Probe {
                void work() throws IOException, InterruptedException { }
                void run() throws IOException, InterruptedException {
                    try { work(); }
                    catch (IOException | InterruptedException e) { System.out.println(e); throw e; }
                }
            }
            """;
    private static final String MULTI_CATCH_RETHROW_DECLARES_ONE = """
            import java.io.IOException;
            class Probe {
                void work() throws IOException, InterruptedException { }
                void run() throws IOException {
                    try { work(); }
                    catch (IOException | InterruptedException e) { System.out.println(e); throw e; }
                }
            }
            """;
    private static final String MULTI_CATCH_PARAMETER_IS_THE_COMMON_SUPERCLASS = """
            import java.io.*;
            class Probe {
                void read() throws FileNotFoundException, EOFException { }
                void run() {
                    try { read(); }
                    catch (FileNotFoundException | EOFException e) { IOException io = e; }
                }
            }
            """;
    private static final String MULTI_CATCH_PARAMETER_IS_NOT_AN_ALTERNATIVE = """
            import java.io.*;
            class Probe {
                void read() throws FileNotFoundException, EOFException { }
                void run() {
                    try { read(); }
                    catch (FileNotFoundException | EOFException e) { FileNotFoundException f = e; }
                }
            }
            """;

    private static final String METHOD_WITHOUT_RETURN_TYPE = """
            class Probe {
                public validate(int age) { }
            }
            """;

    @Test
    @DisplayName(
            "Q06.01 · new on an abstract class is a compile error, and only reflection throws InstantiationException")
    void q06_01_abstractClassInstantiation() throws Exception {
        assertErrors(NEW_ON_ABSTRACT_CLASS, ABSTRACT_INSTANTIATED);

        var compiled = InMemoryCompiler.compile(Map.of(SOURCE_NAME, REFLECTION_ON_ABSTRACT_CLASS));
        var constructor = compiled.load(SOURCE_NAME).getConstructor();

        assertThatThrownBy(constructor::newInstance).isInstanceOf(InstantiationException.class);
    }

    @Test
    @DisplayName(
            "Q06.03 · the value is computed before finally, a returned list is mutated, finally's return or throw wins")
    void q06_03_returnAndFinally() {
        assertThat(OutputCapture.linesOf(() -> Q06_03.main(new String[0])))
                .containsExactly(
                        "try",
                        "finally",
                        "result",
                        "1",
                        "[try, finally]",
                        "42",
                        "java.lang.IllegalStateException: second cause=null suppressed=0");
    }

    @Test
    @DisplayName("Q06.05 · A: a catch for IOException after catch (Exception e) does not compile")
    void q06_05_snippetA() {
        assertErrors(SNIPPET_A_CATCH_ORDER, ALREADY_CAUGHT);
    }

    @Test
    @DisplayName("Q06.05 · B: catching InterruptedException around code that cannot throw it does not compile")
    void q06_05_snippetB() {
        assertErrors(SNIPPET_B_UNTHROWN_CHECKED, NEVER_THROWN);
    }

    @Test
    @DisplayName("Q06.05 · C: a statement after throw is unreachable")
    void q06_05_snippetC() {
        assertErrors(SNIPPET_C_AFTER_THROW, UNREACHABLE);
    }

    @Test
    @DisplayName("Q06.05 · D: a statement between try and catch is a syntax error")
    void q06_05_snippetD() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, SNIPPET_D_STATEMENT_BETWEEN));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes())
                .containsExactly(
                        "compiler.err.try.without.catch.finally.or.resource.decls", "compiler.err.catch.without.try");
    }

    @Test
    @DisplayName("Q06.05 · E: a nested try with only finally compiles, and the outer catch gets the inner exception")
    void q06_05_snippetE() throws Exception {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, SNIPPET_E_NESTED));
        assertThat(result.errorCodes()).isEmpty();

        Class<?> probe = result.load(SOURCE_NAME);
        Object events = probe.getMethod("run").invoke(probe.getConstructor().newInstance());

        assertThat(events).isEqualTo("inner finally, outer caught disk");
    }

    @Test
    @DisplayName("Q06.06 · rethrowing a multi-catch parameter must declare every checked alternative")
    void q06_06_multiCatchRethrow() {
        var both = InMemoryCompiler.compile(Map.of(SOURCE_NAME, MULTI_CATCH_RETHROW_DECLARES_BOTH));
        assertThat(both.errorCodes()).isEmpty();

        assertErrors(MULTI_CATCH_RETHROW_DECLARES_ONE, UNREPORTED);
    }

    @Test
    @DisplayName("Q06.06 · a multi-catch parameter has the alternatives' common superclass as its type")
    void q06_06_multiCatchParameterType() {
        var common = InMemoryCompiler.compile(Map.of(SOURCE_NAME, MULTI_CATCH_PARAMETER_IS_THE_COMMON_SUPERCLASS));
        assertThat(common.errorCodes()).isEmpty();

        assertErrors(MULTI_CATCH_PARAMETER_IS_NOT_AN_ALTERNATIVE, INCOMPATIBLE_TYPES);
    }

    @Test
    @DisplayName("Q06.07 · resources close in reverse order before catch, and both close failures are suppressed")
    void q06_07_twoResourcesWithFailingClose() {
        assertThat(OutputCapture.linesOf(() -> Q06_07.main(new String[0])))
                .containsExactly(
                        "open A",
                        "open B",
                        "body",
                        "close B",
                        "close A",
                        "caught body failed",
                        "suppressed close B failed",
                        "suppressed close A failed",
                        "finally");
    }

    @Test
    @DisplayName("Q06.08 · a cause constructor that never calls super(message, cause) drops the cause from the trace")
    void q06_08_lossyCauseConstructor() {
        IOException reset = new IOException("Connection reset");

        var lossy = new Q06_08.LossyExportException("Failed to export batch b-7", reset);
        var fixed = new Q06_08.BatchExportException("Failed to export batch b-7", reset);

        assertThat(lossy.getCause()).isNull();
        assertThat(traceOf(lossy)).doesNotContain("Caused by").doesNotContain("IOException");
        assertThat(fixed.getCause()).isSameAs(reset);
        assertThat(traceOf(fixed)).contains("Caused by: java.io.IOException: Connection reset");
    }

    @Test
    @DisplayName("Q06.08 · concatenating an exception into a log message keeps only its toString")
    void q06_08_concatenationKeepsOnlyToString() {
        var fixed = new Q06_08.BatchExportException("Failed to export batch b-7", new IOException("Connection reset"));

        String line = "export failed: " + fixed;

        assertThat(line)
                .isEqualTo("export failed: dev.interview.javalanguage.m06.outputs.Q06_08$BatchExportException:"
                        + " Failed to export batch b-7");
    }

    @Test
    @DisplayName("Q06.09 · rootCause follows getCause to the end, and stops on a cause cycle")
    void q06_09_rootCause() {
        IOException root = new IOException("disk full");
        var middle = new UncheckedIOException("write failed", root);
        var top = new IllegalStateException("export failed", middle);
        var first = new IllegalStateException("first");
        var second = new IllegalStateException("second");
        first.initCause(second);
        second.initCause(first);

        assertThat(Q06_09.rootCause(top)).isSameAs(root);
        assertThat(Q06_09.rootCause(root)).isSameAs(root);
        assertThat(Q06_09.rootCause(first)).isIn(first, second);
    }

    @Test
    @DisplayName("Q06.09 · initCause attaches a cause to a type that has no cause constructor")
    void q06_09_initCauseOnLegacyType() {
        var denied = new AccessDeniedException("/data/report.csv");

        Throwable chained = new FileNotFoundException("/data/report.csv").initCause(denied);

        assertThat(chained).isInstanceOf(FileNotFoundException.class).hasCause(denied);
        assertThat(FileNotFoundException.class.getConstructors())
                .allSatisfy(c -> assertThat(c.getParameterTypes()).doesNotContain(Throwable.class));
        assertThat(NoClassDefFoundError.class.getConstructors())
                .allSatisfy(c -> assertThat(c.getParameterTypes()).doesNotContain(Throwable.class));
    }

    @Test
    @DisplayName("Q06.10 · a method declared without a return type does not compile")
    void q06_10_methodWithoutReturnType() {
        assertErrors(METHOD_WITHOUT_RETURN_TYPE, "compiler.err.invalid.meth.decl.ret.type.req");
    }

    @Test
    @DisplayName("Q06.11 · a shared exception with suppression enabled collects one suppressed exception per throw")
    void q06_11_sharedExceptionAccumulatesSuppressed() {
        int before = Q06_11.SHARED.getSuppressed().length;

        for (int request = 0; request < 3; request++) {
            Throwable thrown = catchThrowable(() -> Q06_11.reject(Q06_11.SHARED, Q06OutputsTest::failToRelease));
            assertThat(thrown).isSameAs(Q06_11.SHARED);
        }

        assertThat(Q06_11.SHARED.getSuppressed()).hasSize(before + 3);
        assertThat(Q06_11.SHARED.getStackTrace()[0].getMethodName()).isEqualTo("<clinit>");
    }

    @Test
    @DisplayName("Q06.11 · a shared exception with suppression and stack trace disabled stays empty")
    void q06_11_frozenSharedExceptionStaysEmpty() {
        for (int request = 0; request < 3; request++) {
            Throwable thrown = catchThrowable(() -> Q06_11.reject(Q06_11.SHARED_FROZEN, Q06OutputsTest::failToRelease));
            assertThat(thrown).isSameAs(Q06_11.SHARED_FROZEN);
        }

        assertThat(Q06_11.SHARED_FROZEN.getSuppressed()).isEmpty();
        assertThat(Q06_11.SHARED_FROZEN.getStackTrace()).isEmpty();
    }

    @Test
    @DisplayName("Q06.12 · ClassNotFoundException by name, then ExceptionInInitializerError, then NoClassDefFoundError")
    void q06_12_failedStaticInitializer() {
        assertThat(OutputCapture.linesOf(() -> Q06_12.main(new String[0])))
                .containsExactly(
                        "1: java.lang.ClassNotFoundException: com.example.MissingDriver",
                        "2: ExceptionInInitializerError, message null",
                        "   cause NumberFormatException",
                        "3: NoClassDefFoundError, message Could not initialize class"
                                + " dev.interview.javalanguage.m06.outputs.Q06_12$Settings",
                        "   cause ExceptionInInitializerError");
    }

    @Test
    @DisplayName("Q06.13 · a periodic task that throws once never runs again, and only its future holds the failure")
    void q06_13_periodicTaskStopsAfterFailure() throws Exception {
        AtomicInteger runs = new AtomicInteger();
        AtomicInteger handlerCalls = new AtomicInteger();
        var scheduler = new ScheduledThreadPoolExecutor(
                1, PoolThreads.withHandler("nightly-", (t, e) -> handlerCalls.incrementAndGet()));

        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(
                () -> {
                    if (runs.incrementAndGet() == 2) {
                        throw NIGHTLY_FAILURE;
                    }
                },
                0,
                1,
                TimeUnit.MILLISECONDS);
        Throwable thrown = catchThrowable(() -> future.get(10, TimeUnit.SECONDS));
        int runsWhenDone = runs.get();
        scheduler.shutdown();
        assertThat(scheduler.awaitTermination(10, TimeUnit.SECONDS)).isTrue();

        assertThat(thrown).isInstanceOf(ExecutionException.class).hasCause(NIGHTLY_FAILURE);
        assertThat(future.isDone()).isTrue();
        assertThat(runsWhenDone).isEqualTo(2);
        assertThat(runs).hasValue(2);
        assertThat(handlerCalls).hasValue(0);
    }

    @Test
    @DisplayName("Q06.13 · a periodic task that reports its own failures keeps running after one")
    void q06_13_reportingTaskKeepsItsSchedule() throws Exception {
        AtomicInteger runs = new AtomicInteger();
        CountDownLatch threeRuns = new CountDownLatch(3);
        List<RuntimeException> reported = new CopyOnWriteArrayList<>();
        var scheduler = new ScheduledThreadPoolExecutor(1);
        Runnable nightly = () -> {
            threeRuns.countDown();
            if (runs.incrementAndGet() == 2) {
                throw NIGHTLY_FAILURE;
            }
        };

        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(
                Q06_13.reportingFailures(nightly, reported::add), 0, 1, TimeUnit.MILLISECONDS);
        boolean ranThreeTimes = threeRuns.await(10, TimeUnit.SECONDS);
        boolean doneBeforeCancel = future.isDone();
        future.cancel(false);
        scheduler.shutdown();
        assertThat(scheduler.awaitTermination(10, TimeUnit.SECONDS)).isTrue();

        assertThat(ranThreeTimes).isTrue();
        assertThat(doneBeforeCancel).isFalse();
        assertThat(reported).containsExactly(NIGHTLY_FAILURE);
    }

    @Test
    @DisplayName("Q06.14 · catch-log-return-null turns an I/O failure into a null and a message-only log line")
    void q06_14_returnNullHidesTheFailure() {
        List<String> log = new ArrayList<>();
        var service = new Q06_14.StockService(
                sku -> {
                    throw new IOException("Connection reset");
                },
                log);

        assertThat(service.availableStock("sku-1")).isNull();
        assertThat(log).containsExactly("could not fetch stock for sku-1: Connection reset");
        assertThatThrownBy(() -> {
                    int stock = service.availableStock("sku-1");
                    System.out.println(stock);
                })
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("Q06.14 · catching Exception also swallows InterruptedException and clears the interrupt")
    void q06_14_swallowedInterrupt() {
        var service = new Q06_14.StockService(Q06OutputsTest::blockingFetch, new ArrayList<>());
        try {
            Thread.currentThread().interrupt();

            assertThat(service.availableStock("sku-1")).isNull();
            assertThat(Thread.currentThread().isInterrupted()).isFalse();
        } finally {
            Thread.interrupted();
        }
    }

    @Test
    @DisplayName("Q06.14 · the fix translates IOException with its cause and lets InterruptedException propagate")
    void q06_14_fixedService() {
        IOException reset = new IOException("Connection reset");
        var failing = new Q06_14.FixedStockService(sku -> {
            throw reset;
        });
        var blocking = new Q06_14.FixedStockService(Q06OutputsTest::blockingFetch);

        assertThatThrownBy(() -> failing.availableStock("sku-1"))
                .isInstanceOf(Q06_14.StockUnavailableException.class)
                .hasMessage("stock unavailable for sku-1")
                .hasCause(reset);
        try {
            Thread.currentThread().interrupt();
            assertThatThrownBy(() -> blocking.availableStock("sku-1")).isInstanceOf(InterruptedException.class);
        } finally {
            Thread.interrupted();
        }
    }

    // Stand-in for a blocking call: like Thread.sleep, it clears the interrupt status and throws.
    private static int blockingFetch(String sku) throws InterruptedException {
        if (Thread.interrupted()) {
            throw new InterruptedException("sleep interrupted");
        }
        return 7;
    }

    private static void failToRelease() {
        throw new IllegalStateException("slot release failed");
    }

    private static String traceOf(Throwable failure) {
        StringWriter out = new StringWriter();
        failure.printStackTrace(new PrintWriter(out));
        return out.toString();
    }

    private static void assertErrors(String source, String expectedKey) {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, source));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(expectedKey);
    }
}
