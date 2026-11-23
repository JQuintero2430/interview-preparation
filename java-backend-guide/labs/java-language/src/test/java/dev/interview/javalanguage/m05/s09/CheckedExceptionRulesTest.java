package dev.interview.javalanguage.m05.s09;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Diagnostic keys, not message text (JLS 25 §11.2.3 for lambda bodies and catch clauses, §15.13.2 for method
// references).
class CheckedExceptionRulesTest {

    private static final String SOURCE_NAME = "Reader";
    private static final String UNREPORTED = "compiler.err.unreported.exception.need.to.catch.or.throw";
    private static final String MREF_THROWS = "compiler.err.incompatible.thrown.types.in.mref";
    private static final String NEVER_THROWN = "compiler.err.except.never.thrown.in.try";

    private static final String AS_FUNCTION = """
            import java.nio.file.*;
            import java.util.function.Function;
            class Reader { Function<Path, String> read = p -> Files.readString(p); }
            """;
    private static final String AS_METHOD_REFERENCE = """
            import java.nio.file.*;
            import java.util.List;
            class Reader { List<String> read(List<Path> ps) { return ps.stream().map(Files::readString).toList(); } }
            """;
    private static final String AS_THROWING_INTERFACE = """
            import java.io.IOException;
            import java.nio.file.*;
            class Reader {
                interface IoFunction<T, R> { R apply(T t) throws IOException; }
                IoFunction<Path, String> read = p -> Files.readString(p);
            }
            """;
    private static final String CATCH_AROUND_SNEAKY = """
            import java.io.IOException;
            class Reader {
                static <E extends Throwable> RuntimeException sneaky(Throwable t) throws E { throw (E) t; }
                void run() {
                    try { throw sneaky(new IOException("disk")); } catch (IOException e) { }
                }
            }
            """;

    @Test
    @DisplayName("M05 §9 · a lambda that throws IOException does not compile as a Function")
    void compile_fails_whenLambdaThrowsCheckedExceptionIntoFunction() {
        assertThat(errorCodes(AS_FUNCTION)).containsExactly(UNREPORTED);
    }

    @Test
    @DisplayName(
            "M05 §9 · a method reference that throws IOException does not compile as a Function either, with its own key")
    void compile_fails_whenMethodReferenceThrowsCheckedExceptionIntoFunction() {
        assertThat(errorCodes(AS_METHOD_REFERENCE)).containsExactly(MREF_THROWS);
    }

    @Test
    @DisplayName("M05 §9 · the same lambda compiles when the target function type declares throws IOException")
    void compile_succeeds_whenTargetDeclaresTheCheckedException() {
        assertThat(errorCodes(AS_THROWING_INTERFACE)).isEmpty();
    }

    @Test
    @DisplayName("M05 §9 · a catch for a sneakily thrown IOException does not compile")
    void compile_fails_whenCatchingSneakilyThrownCheckedException() {
        assertThat(errorCodes(CATCH_AROUND_SNEAKY)).containsExactly(NEVER_THROWN);
    }

    private static List<String> errorCodes(String source) {
        return InMemoryCompiler.compile(Map.of(SOURCE_NAME, source)).errorCodes();
    }
}
