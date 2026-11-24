package dev.interview.javalanguage.m06.s01;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Diagnostic keys, not message text: javac messages are localized and reworded between releases.
class ExceptionCompileRulesTest {

    private static final String SOURCE_NAME = "Rules";
    private static final String UNREPORTED = "compiler.err.unreported.exception.need.to.catch.or.throw";
    private static final String OVERRIDE_THROWS = "compiler.err.override.meth.doesnt.throw";
    private static final String GENERIC_THROWABLE = "compiler.err.generic.throwable";

    private static final String CHECKED_NOT_HANDLED = """
            import java.io.IOException;
            class Rules {
                void open() throws IOException { throw new IOException("disk"); }
                void caller() { open(); }
            }
            """;
    private static final String CHECKED_DECLARED_OR_CAUGHT = """
            import java.io.IOException;
            import java.io.UncheckedIOException;
            class Rules {
                void open() throws IOException { throw new IOException("disk"); }
                void declares() throws IOException { open(); }
                void catches() {
                    try { open(); } catch (IOException e) { throw new UncheckedIOException(e); }
                }
            }
            """;
    private static final String UNCHECKED_NEITHER_DECLARED_NOR_CAUGHT = """
            class Rules {
                void check(int quantity) {
                    if (quantity < 0) throw new IllegalArgumentException("negative");
                    if (quantity > 1_000) throw new StackOverflowError();
                }
                void caller() { check(-1); }
                void documented() throws IllegalStateException { caller(); }
            }
            """;
    private static final String OVERRIDE_ADDS_CHECKED = """
            class Point { void move(int dx) { } }
            class Rules extends Point {
                @Override void move(int dx) throws Exception { if (dx < 0) throw new Exception("left"); }
            }
            """;
    private static final String OVERRIDE_NARROWS_OR_ADDS_UNCHECKED = """
            import java.io.FileNotFoundException;
            import java.io.IOException;
            class Store { void save() throws IOException { } }
            class Narrower extends Store { @Override void save() throws FileNotFoundException { } }
            class None extends Store { @Override void save() { } }
            class Rules extends Store { @Override void save() throws IllegalStateException { } }
            """;
    private static final String GENERIC_EXCEPTION_CLASS = """
            class Rules<T> extends Exception { }
            """;

    @Test
    @DisplayName("M06 §1 · an unreported checked exception does not compile")
    void compile_fails_whenCheckedExceptionIsNeitherCaughtNorDeclared() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, CHECKED_NOT_HANDLED));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(UNREPORTED);
    }

    @Test
    @DisplayName("M06 §1 · a checked exception compiles once it is declared or caught")
    void compile_succeeds_whenCheckedExceptionIsDeclaredOrCaught() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, CHECKED_DECLARED_OR_CAUGHT));

        assertThat(result.errorCodes()).isEmpty();
    }

    @Test
    @DisplayName("M06 §1 · unchecked exceptions and errors need no catch and no throws, and throws may list them")
    void compile_succeeds_whenUncheckedExceptionsAreNeitherCaughtNorDeclared() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, UNCHECKED_NEITHER_DECLARED_NOR_CAUGHT));

        assertThat(result.errorCodes()).isEmpty();
    }

    @Test
    @DisplayName("M06 §1 · an override that adds a checked exception does not compile")
    void compile_fails_whenOverrideDeclaresBroaderCheckedException() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, OVERRIDE_ADDS_CHECKED));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(OVERRIDE_THROWS);
    }

    @Test
    @DisplayName("M06 §1 · an override may throw a narrower checked exception, none, or any unchecked one")
    void compile_succeeds_whenOverrideNarrowsThrowsOrAddsUnchecked() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, OVERRIDE_NARROWS_OR_ADDS_UNCHECKED));

        assertThat(result.errorCodes()).isEmpty();
    }

    @Test
    @DisplayName("M06 §1 · a subclass of Throwable cannot be generic")
    void compile_fails_whenExceptionClassIsGeneric() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, GENERIC_EXCEPTION_CLASS));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(GENERIC_THROWABLE);
    }
}
