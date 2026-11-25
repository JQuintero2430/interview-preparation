package dev.interview.javalanguage.m06.outputs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import dev.interview.javalanguage.m01.support.OutputCapture;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// The printed lines and diagnostic keys are the claims the guide makes, so the expected values stay literal.
class Q06OutputsTest {

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

    private static void assertErrors(String source, String expectedKey) {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, source));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(expectedKey);
    }
}
