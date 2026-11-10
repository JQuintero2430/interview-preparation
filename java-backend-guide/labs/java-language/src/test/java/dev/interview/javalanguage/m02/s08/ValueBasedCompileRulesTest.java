package dev.interview.javalanguage.m02.s08;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.List;
import java.util.Map;
import javax.tools.Diagnostic;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** Module 02 §8: javac's compile-time warning for synchronizing on value-based classes. */
class ValueBasedCompileRulesTest {

    private static final String SOURCE_NAME = "Lock";
    private static final String WARNING = "compiler.warn.attempt.to.synchronize.on.instance.of.value.based.class";
    private static final String LINT_OFF = "-Xlint:-synchronization";

    private static final String SYNC_ON_INTEGER = "class Lock { void run(Integer id) { synchronized (id) { } } }";
    private static final String SYNC_ON_OBJECT =
            "class Lock { void run(Integer id) { Object lock = id; synchronized (lock) { } } }";
    private static final String SYNC_ON_OPTIONAL_AND_DATE = """
            class Lock {
                void run(java.util.Optional<String> o, java.time.LocalDate d) {
                    synchronized (o) { }
                    synchronized (d) { }
                }
            }
            """;

    private static final int TWO_WARNINGS = 2;

    @Test
    @DisplayName("M02 §8 · synchronizing on an Integer is a javac warning")
    void compile_warns_whenSynchronizingOnInteger() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, SYNC_ON_INTEGER));

        assertThat(result.success()).isTrue();
        assertThat(warningCodes(result)).contains(WARNING);
    }

    @Test
    @DisplayName("M02 §8 · the warning is on by default and -Xlint:-synchronization turns it off")
    void compile_doesNotWarn_whenSynchronizationLintIsDisabled() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, SYNC_ON_INTEGER), LINT_OFF);

        assertThat(result.success()).isTrue();
        assertThat(warningCodes(result)).doesNotContain(WARNING);
    }

    @Test
    @DisplayName("M02 §8 · javac does not warn when the static type is Object")
    void compile_doesNotWarn_whenStaticTypeIsObject() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, SYNC_ON_OBJECT));

        assertThat(result.success()).isTrue();
        assertThat(warningCodes(result)).doesNotContain(WARNING);
    }

    @Test
    @DisplayName("M02 §8 · Optional and LocalDate are value-based for javac too")
    void compile_warnsTwice_whenSynchronizingOnOptionalAndLocalDate() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, SYNC_ON_OPTIONAL_AND_DATE));

        assertThat(result.success()).isTrue();
        assertThat(warningCodes(result).stream().filter(WARNING::equals).count())
                .isEqualTo(TWO_WARNINGS);
    }

    private static List<String> warningCodes(InMemoryCompiler.Result result) {
        return result.diagnostics().stream()
                .filter(d -> d.getKind() == Diagnostic.Kind.WARNING || d.getKind() == Diagnostic.Kind.MANDATORY_WARNING)
                .map(Diagnostic::getCode)
                .toList();
    }
}
