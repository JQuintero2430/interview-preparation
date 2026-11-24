package dev.interview.javalanguage.m06.s02;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Diagnostic keys, not message text: javac messages are localized and reworded between releases.
class TryCompileRulesTest {

    private static final String SOURCE_NAME = "Handlers";
    private static final String ALREADY_CAUGHT = "compiler.err.except.already.caught";
    private static final String NEVER_THROWN = "compiler.err.except.never.thrown.in.try";
    private static final String UNREACHABLE = "compiler.err.unreachable.stmt";
    private static final String MULTICATCH_ASSIGNED = "compiler.err.multicatch.parameter.may.not.be.assigned";
    private static final String MULTICATCH_NOT_DISJOINT = "compiler.err.multicatch.types.must.be.disjoint";
    private static final String BARE_TRY = "compiler.err.try.without.catch.finally.or.resource.decls";
    private static final String UNREPORTED = "compiler.err.unreported.exception.need.to.catch.or.throw";

    private static final String SUBCLASS_AFTER_SUPERCLASS = """
            import java.io.*;
            class Handlers {
                void read() throws IOException { }
                void run() {
                    try { read(); }
                    catch (IOException e) { }
                    catch (FileNotFoundException e) { }
                }
            }
            """;
    private static final String CHECKED_NEVER_THROWN = """
            import java.io.IOException;
            class Handlers {
                void run() {
                    try { System.out.println("no I/O here"); }
                    catch (IOException e) { }
                }
            }
            """;
    private static final String BROAD_CATCHES_ALWAYS_ALLOWED = """
            class Handlers {
                void run() {
                    try { System.out.println("no I/O here"); }
                    catch (RuntimeException e) { }
                    catch (Exception e) { }
                    catch (Throwable t) { }
                }
            }
            """;
    private static final String STATEMENT_AFTER_THROW = """
            class Handlers {
                void run() {
                    throw new IllegalStateException();
                    System.out.println("never");
                }
            }
            """;
    private static final String ASSIGN_MULTICATCH_PARAMETER = """
            import java.io.IOException;
            class Handlers {
                void read() throws IOException, InterruptedException { }
                void run() {
                    try { read(); }
                    catch (IOException | InterruptedException e) { e = new IOException("replaced"); }
                }
            }
            """;
    private static final String RELATED_MULTICATCH_ALTERNATIVES = """
            import java.io.*;
            class Handlers {
                void read() throws IOException { }
                void run() {
                    try { read(); }
                    catch (FileNotFoundException | IOException e) { }
                }
            }
            """;
    private static final String TRY_WITHOUT_CATCH_OR_FINALLY = """
            class Handlers {
                void run() {
                    try { System.out.println("alone"); }
                }
            }
            """;
    private static final String PRECISE_RETHROW = """
            import java.io.IOException;
            class Handlers {
                void read() throws IOException { }
                void run() throws IOException {
                    try { read(); }
                    catch (Exception e) { System.out.println("logging " + e); throw e; }
                }
            }
            """;
    private static final String RETHROW_AFTER_REASSIGNMENT = """
            import java.io.IOException;
            class Handlers {
                void read() throws IOException { }
                void run() throws IOException {
                    try { read(); }
                    catch (Exception e) { e = new Exception("wrapped", e); throw e; }
                }
            }
            """;

    @Test
    @DisplayName("M06 §2 · a catch for a subclass after its superclass does not compile")
    void compile_fails_whenSubclassIsCaughtAfterSuperclass() {
        assertErrors(SUBCLASS_AFTER_SUPERCLASS, ALREADY_CAUGHT);
    }

    @Test
    @DisplayName("M06 §2 · catching a checked exception the try cannot throw does not compile")
    void compile_fails_whenCaughtCheckedExceptionCannotBeThrown() {
        assertErrors(CHECKED_NEVER_THROWN, NEVER_THROWN);
    }

    @Test
    @DisplayName(
            "M06 §2 · catch (Exception e) and catch (Throwable t) are allowed even when the try throws nothing checked")
    void compile_succeeds_forBroadCatchesAroundCodeThatThrowsNothingChecked() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, BROAD_CATCHES_ALWAYS_ALLOWED));

        assertThat(result.errorCodes()).isEmpty();
    }

    @Test
    @DisplayName("M06 §2 · a statement after throw is unreachable")
    void compile_fails_forStatementAfterThrow() {
        assertErrors(STATEMENT_AFTER_THROW, UNREACHABLE);
    }

    @Test
    @DisplayName("M06 §2 · a multi-catch parameter cannot be assigned")
    void compile_fails_whenMultiCatchParameterIsAssigned() {
        assertErrors(ASSIGN_MULTICATCH_PARAMETER, MULTICATCH_ASSIGNED);
    }

    @Test
    @DisplayName("M06 §2 · multi-catch alternatives may not be related by subclassing")
    void compile_fails_whenMultiCatchAlternativesAreRelated() {
        assertErrors(RELATED_MULTICATCH_ALTERNATIVES, MULTICATCH_NOT_DISJOINT);
    }

    @Test
    @DisplayName("M06 §2 · a try needs a catch, a finally or resources")
    void compile_fails_forBareTry() {
        assertErrors(TRY_WITHOUT_CATCH_OR_FINALLY, BARE_TRY);
    }

    @Test
    @DisplayName("M06 §2 · precise rethrow lets a method declare only IOException after catch (Exception e)")
    void compile_succeeds_forPreciseRethrowOfEffectivelyFinalParameter() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, PRECISE_RETHROW));

        assertThat(result.errorCodes()).isEmpty();
    }

    @Test
    @DisplayName("M06 §2 · reassigning the catch parameter turns precise rethrow off")
    void compile_fails_whenRethrownParameterWasReassigned() {
        assertErrors(RETHROW_AFTER_REASSIGNMENT, UNREPORTED);
    }

    private static void assertErrors(String source, String expectedKey) {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, source));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(expectedKey);
    }
}
