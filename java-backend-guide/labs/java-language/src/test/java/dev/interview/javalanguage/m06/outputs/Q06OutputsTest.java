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
import java.lang.classfile.ClassFile;
import java.lang.classfile.ClassModel;
import java.lang.classfile.instruction.InvokeDynamicInstruction;
import java.nio.charset.StandardCharsets;
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

    private static final String CONCAT_SOURCE = """
            import java.util.List;
            public class Labels {
                public String label(String id, int n) { return "order " + id + "#" + n; }
                public String joined(List<String> parts) {
                    String out = "";
                    for (String part : parts) { out += part; }
                    return out;
                }
            }
            """;
    private static final String UNICODE_ESCAPE_IN_COMMENT = """
            public class Probe {
                public static int value() {
                    int x = 1;
                    // the escape ends this comment early: \\u000a x = 2;
                    return x;
                }
            }
            """;
    private static final String UNICODE_IDENTIFIER = """
            public class Probe { public static int größe = 3; }
            """;
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

    @Test
    @DisplayName("Q06.15 · only literals, constant expressions and intern() compare == to the literal")
    void q06_15_stringIdentity() {
        assertThat(OutputCapture.linesOf(() -> Q06_15.main(new String[0])))
                .containsExactly(
                        "1 true", "2 true", "3 true", "4 false", "5 true", "6 false", "7 true", "8 true", "false");
    }

    @Test
    @DisplayName("Q06.16 · a string interned before its literal is first used becomes the literal's value (HotSpot)")
    void q06_16_internBeforeLiteral() {
        assertThat(Q06_16.internBeforeTheLiteralIsUsed()).isEqualTo(new Q06_16.InternFirst(true, true));
    }

    @Test
    @DisplayName("Q06.16 · new String(literal) is one more object, equal to the pooled literal and never == to it")
    @SuppressWarnings({"StringEquality", "StringOperationCanBeSimplified"})
    void q06_16_newStringIsANewObjectEveryTime() {
        String first = new String("q06-16");
        String second = new String("q06-16");

        assertThat(first).isNotSameAs(second).isNotSameAs("q06-16").isEqualTo("q06-16");
        assertThat(first.intern()).isSameAs(second.intern()).isSameAs("q06-16");
    }

    @Test
    @DisplayName("Q06.17 · the concat recipe holds the constants inline and \\u0001 for each runtime argument")
    void q06_17_concatRecipe() {
        var result = InMemoryCompiler.compile(Map.of("Labels", CONCAT_SOURCE));
        assertThat(result.success()).isTrue();
        ClassModel model = ClassFile.of().parse(result.classes().get("Labels"));

        List<InvokeDynamicInstruction> label = invokeDynamicsIn(model, "label");
        assertThat(label).hasSize(1);
        assertThat(label.getFirst().bootstrapArgs()).containsExactly("order \u0001#\u0001");
        assertThat(label.getFirst().typeSymbol().descriptorString())
                .isEqualTo("(Ljava/lang/String;I)Ljava/lang/String;");
    }

    @Test
    @DisplayName("Q06.17 · += in a loop compiles to one concat call site that runs once per iteration")
    void q06_17_concatInALoop() throws Exception {
        var result = InMemoryCompiler.compile(Map.of("Labels", CONCAT_SOURCE));
        ClassModel model = ClassFile.of().parse(result.classes().get("Labels"));

        assertThat(invokeDynamicsIn(model, "joined")).hasSize(1);
        Class<?> labels = result.load("Labels");
        Object joined = labels.getMethod("joined", List.class)
                .invoke(labels.getConstructor().newInstance(), List.of("a", "b", "c"));
        assertThat(joined).isEqualTo("abc");
    }

    @Test
    @DisplayName("Q06.17 · string conversion: a double, a char and null in a concatenation")
    @SuppressWarnings("ConstantValue")
    void q06_17_stringConversion() {
        double price = 2.5;
        String missing = null;

        assertThat("price " + price).isEqualTo("price 2.5");
        assertThat("price " + price * 2).isEqualTo("price 5.0");
        assertThat("" + 1e7 + " " + 1e-4).isEqualTo("1.0E7 1.0E-4");
        assertThat('a' + 'b' + "!").isEqualTo("195!");
        assertThat(missing + missing).isEqualTo("nullnull");
    }

    @Test
    @DisplayName("Q06.18 · StringBuilder keeps Object.equals, compares by content, and reverses surrogate pairs whole")
    void q06_18_builderEqualityAndReverse() {
        StringBuilder one = new StringBuilder("ana");
        StringBuilder other = new StringBuilder("ana");

        assertThat(one.equals(other)).isFalse();
        assertThat(one.compareTo(other)).isZero();
        assertThat("ana".contentEquals(one)).isTrue();
        assertThat(new StringBuilder("a😀b").reverse().toString()).isEqualTo("b😀a");
    }

    @Test
    @DisplayName("Q06.18 · a default StringBuilder holds 16 chars, and one more grows it to twice plus 2")
    void q06_18_builderCapacity() {
        StringBuilder builder = new StringBuilder();
        int initial = builder.capacity();
        builder.append("x".repeat(17));

        assertThat(initial).isEqualTo(16);
        assertThat(builder.capacity()).isEqualTo(34);
        assertThat(new StringBuilder(1_000).capacity()).isEqualTo(1_000);
    }

    @Test
    @DisplayName("Q06.18 · concurrent StringBuffer appends never interleave inside one append")
    void q06_18_bufferAppendsAreAtomic() throws Exception {
        StringBuffer shared = new StringBuffer();
        CountDownLatch start = new CountDownLatch(1);
        Runnable writer = () -> {
            awaitQuietly(start);
            for (int i = 0; i < 10_000; i++) {
                shared.append("ab");
            }
        };
        Thread first = Thread.ofPlatform().start(writer);
        Thread second = Thread.ofPlatform().start(writer);
        start.countDown();
        first.join();
        second.join();

        assertThat(shared.length()).isEqualTo(40_000);
        assertThat(shared.toString().replace("ab", "")).isEmpty();
    }

    @Test
    @DisplayName("Q06.19 · split, a text block's closing delimiter, and trim vs strip")
    void q06_19_stringApiTraps() {
        assertThat(OutputCapture.linesOf(() -> Q06_19.main(new String[0])))
                .containsExactly(
                        "1 [7, ana, , lima]",
                        "2 6",
                        "3 ,lima,,",
                        "4 1 0",
                        "5 0 3",
                        "6 __{|____\"id\":_7|__}|",
                        "7 4 U+2003",
                        "8 3 ana");
    }

    @Test
    @DisplayName("Q06.19 · a closing delimiter at the end of the last line leaves no final newline")
    void q06_19_closingDelimiterOnTheLastLine() {
        String block = """
                {
                  "id": 7
                }""";

        assertThat(block.replace(" ", "_").replace("\n", "|")).isEqualTo("{|__\"id\":_7|}");
    }

    @Test
    @DisplayName("Q06.20 · a Unicode escape in a comment is translated before the comment is recognized")
    void q06_20_unicodeEscapeEndsAComment() throws Exception {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, UNICODE_ESCAPE_IN_COMMENT));
        assertThat(result.errorCodes()).isEmpty();

        Object value = result.load(SOURCE_NAME).getMethod("value").invoke(null);

        assertThat(value).isEqualTo(2);
    }

    @Test
    @DisplayName("Q06.20 · identifiers may use any Unicode letter")
    void q06_20_unicodeIdentifier() throws Exception {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, UNICODE_IDENTIFIER));
        assertThat(result.errorCodes()).isEmpty();

        assertThat(result.load(SOURCE_NAME).getField("größe").get(null)).isEqualTo(3);
        assertThat(Character.isJavaIdentifierStart('ß')).isTrue();
    }

    @Test
    @DisplayName(
            "Q06.20 · bytes per encoding: ASCII has no byte above 127, UTF-16 writes a BOM and JDK 25 UTF-32 does not")
    void q06_20_bytesPerEncoding() {
        assertThat(new String(new byte[] {(byte) 0xE9}, StandardCharsets.US_ASCII))
                .isEqualTo("�");
        assertThat(new String(new byte[] {(byte) 0xE9}, StandardCharsets.ISO_8859_1))
                .isEqualTo("é");
        assertThat("A".getBytes(StandardCharsets.UTF_16)).containsExactly(0xFE, 0xFF, 0x00, 0x41);
        assertThat("A".getBytes(StandardCharsets.UTF_16BE)).hasSize(2);
        assertThat("A😀".getBytes(StandardCharsets.UTF_32BE)).hasSize(8);
        assertThat("A😀".getBytes(StandardCharsets.UTF_32)).hasSize(8);
        assertThat(Character.MAX_CODE_POINT).isEqualTo(0x10FFFF);
        assertThat(Integer.toBinaryString(Character.MAX_CODE_POINT)).hasSize(21);
    }

    @Test
    @DisplayName("Q06.21 · length, code points, UTF-8 bytes, a lone surrogate, and char arithmetic")
    void q06_21_emojiAndAccent() {
        assertThat(OutputCapture.linesOf(() -> Q06_21.main(new String[0])))
                .containsExactly("1 2 1", "2 d83d 1f600", "3 4", "4 1", "5 1 2", "6 2 false", "7 98", "8 b", "9 a1");
    }

    @Test
    @DisplayName("Q06.21 · a char literal is not equal to a one-character string, and a surrogate is not a letter")
    @SuppressWarnings("EqualsBetweenInconvertibleTypes")
    void q06_21_charIsNotAString() {
        String emoji = "😀";

        assertThat("a".equals('a')).isFalse();
        assertThat("a".equals(String.valueOf('a'))).isTrue();
        assertThat(Character.isLetter(emoji.charAt(0))).isFalse();
        assertThat(Character.isLetter(emoji.codePointAt(0))).isFalse();
        assertThat(Character.isSurrogate(emoji.charAt(0))).isTrue();
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

    private static List<InvokeDynamicInstruction> invokeDynamicsIn(ClassModel model, String methodName) {
        return model.methods().stream()
                .filter(method -> method.methodName().equalsString(methodName))
                .flatMap(method -> method.code().stream())
                .flatMap(code -> code.elementStream())
                .filter(InvokeDynamicInstruction.class::isInstance)
                .map(InvokeDynamicInstruction.class::cast)
                .toList();
    }

    private static void awaitQuietly(CountDownLatch latch) {
        try {
            latch.await();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
