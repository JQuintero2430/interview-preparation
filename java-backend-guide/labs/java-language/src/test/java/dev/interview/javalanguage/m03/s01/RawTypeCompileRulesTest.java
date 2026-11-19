package dev.interview.javalanguage.m03.s01;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.List;
import java.util.Map;
import javax.tools.Diagnostic;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Diagnostic keys, not message text: javac messages are localized and reworded between releases.
class RawTypeCompileRulesTest {

    private static final String SOURCE_NAME = "Raw";
    private static final String LINT = "-Xlint:rawtypes,unchecked";
    private static final String RAW_USE = "compiler.warn.raw.class.use";
    private static final String UNCHECKED_CALL = "compiler.warn.unchecked.call.mbr.of.raw.type";
    private static final String UNCHECKED_NOTE = "compiler.note.unchecked.filename";
    private static final String INCOMPATIBLE_TYPES = "compiler.err.prob.found.req";

    private static final String RAW_ADD = """
            import java.util.*;
            class Raw {
                List<String> run() {
                    List<String> names = new ArrayList<>();
                    List raw = names;
                    raw.add(42);
                    return names;
                }
            }
            """;
    private static final String TYPED_ADD = """
            import java.util.*;
            class Raw {
                void run() {
                    List<String> names = new ArrayList<>();
                    names.add(42);
                }
            }
            """;
    private static final String SUPPRESS_UNCHECKED = """
            import java.util.*;
            class Raw {
                @SuppressWarnings("unchecked")
                void run(List raw) { raw.add(42); }
            }
            """;
    private static final String SUPPRESS_BOTH = """
            import java.util.*;
            class Raw {
                @SuppressWarnings({"rawtypes", "unchecked"})
                void run(List raw) { raw.add(42); }
            }
            """;

    @Test
    @DisplayName("M03 §1 · a raw List accepts any element and warns under -Xlint:rawtypes,unchecked")
    void compile_warnsTwice_whenRawListIsUsedWithLint() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, RAW_ADD), LINT);

        assertThat(result.success()).isTrue();
        assertThat(warningCodes(result)).contains(RAW_USE, UNCHECKED_CALL);
    }

    @Test
    @DisplayName("M03 §1 · without lint flags javac reports only a note for the unchecked call")
    void compile_reportsOnlyANote_whenNoLintFlagIsGiven() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, RAW_ADD));

        assertThat(result.success()).isTrue();
        assertThat(warningCodes(result)).isEmpty();
        assertThat(noteCodes(result)).contains(UNCHECKED_NOTE);
    }

    @Test
    @DisplayName("M03 §1 · the same add through List<String> is a compile error")
    void compile_fails_whenIntegerIsAddedToListOfString() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, TYPED_ADD));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).contains(INCOMPATIBLE_TYPES);
    }

    @Test
    @DisplayName("M03 §1 · @SuppressWarnings(\"unchecked\") silences the unchecked warning but not the rawtypes one")
    void compile_keepsRawtypesWarning_whenOnlyUncheckedIsSuppressed() {
        var uncheckedOnly = InMemoryCompiler.compile(Map.of(SOURCE_NAME, SUPPRESS_UNCHECKED), LINT);
        var both = InMemoryCompiler.compile(Map.of(SOURCE_NAME, SUPPRESS_BOTH), LINT);

        assertThat(warningCodes(uncheckedOnly)).contains(RAW_USE).doesNotContain(UNCHECKED_CALL);
        assertThat(warningCodes(both)).isEmpty();
    }

    private static List<String> warningCodes(InMemoryCompiler.Result result) {
        return result.diagnostics().stream()
                .filter(d -> d.getKind() == Diagnostic.Kind.WARNING || d.getKind() == Diagnostic.Kind.MANDATORY_WARNING)
                .map(Diagnostic::getCode)
                .toList();
    }

    private static List<String> noteCodes(InMemoryCompiler.Result result) {
        return result.diagnostics().stream()
                .filter(d -> d.getKind() == Diagnostic.Kind.NOTE)
                .map(Diagnostic::getCode)
                .toList();
    }
}
