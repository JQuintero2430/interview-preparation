package dev.interview.javalanguage.m03.s06;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.List;
import java.util.Map;
import javax.tools.Diagnostic;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Module 03 §6: generic array creation, the varargs warnings and where @SafeVarargs is allowed.
class GenericArrayCompileRulesTest {

    private static final String SOURCE_NAME = "Raw";
    private static final String LINT_UNCHECKED = "-Xlint:unchecked";
    private static final String UNCHECKED_NOTE = "compiler.note.unchecked.filename";
    private static final String GENERIC_ARRAY_CREATION = "compiler.err.generic.array.creation";
    private static final String VARARGS_DECLARATION = "compiler.warn.unchecked.varargs.non.reifiable.type";
    private static final String VARARGS_CALL = "compiler.warn.unchecked.generic.array.creation";
    private static final String INVALID_SAFE_VARARGS = "compiler.err.varargs.invalid.trustme.anno";

    private static final String NEW_TYPE_VARIABLE_ARRAY = "<T> T[] make(int n) { return new T[n]; }";
    private static final String NEW_PARAMETERIZED_ARRAY = "Object make() { return new List<String>[3]; }";
    private static final String NEW_UNBOUNDED_WILDCARD_ARRAY = "Object make() { return new List<?>[3]; }";
    private static final String VARARGS_CALLER = """
            void run() { List<String> a = List.of(); List<List<String>> l = listOf(a, a); }
            """;
    private static final String PLAIN_VARARGS =
            "static <T> List<T> listOf(T... items) { return List.of(items); }\n" + VARARGS_CALLER;
    private static final String SAFE_VARARGS =
            "@SafeVarargs static <T> List<T> listOf(T... items) { return List.of(items); }\n" + VARARGS_CALLER;
    private static final String SAFE_VARARGS_ON_INSTANCE_METHOD = "@SafeVarargs <T> void each(T... items) {}";
    private static final String SAFE_VARARGS_ON_ALLOWED_METHODS = """
            @SafeVarargs private <T> void inPrivate(T... items) {}
            @SafeVarargs final <T> void inFinal(T... items) {}
            @SafeVarargs static <T> void inStatic(T... items) {}
            """;

    @Test
    @DisplayName("M03 §6 · new T[] and new List<String>[] do not compile")
    void compile_rejectsArrayCreation_whenComponentTypeIsNotReifiable() {
        assertThat(compile(NEW_TYPE_VARIABLE_ARRAY).errorCodes()).contains(GENERIC_ARRAY_CREATION);
        assertThat(compile(NEW_PARAMETERIZED_ARRAY).errorCodes()).contains(GENERIC_ARRAY_CREATION);
        assertThat(compile(NEW_UNBOUNDED_WILDCARD_ARRAY).success()).isTrue();
    }

    @Test
    @DisplayName("M03 §6 · a generic varargs method warns about heap pollution")
    void compile_warnsAtDeclarationAndCall_whenVarargsElementTypeIsNotReifiable() {
        InMemoryCompiler.Result plain = compile(PLAIN_VARARGS, LINT_UNCHECKED);
        InMemoryCompiler.Result annotated = compile(SAFE_VARARGS, LINT_UNCHECKED);

        assertThat(plain.success()).isTrue();
        assertThat(warningCodes(plain)).contains(VARARGS_DECLARATION, VARARGS_CALL);
        assertThat(annotated.success()).isTrue();
        assertThat(warningCodes(annotated)).doesNotContain(VARARGS_DECLARATION, VARARGS_CALL);
    }

    @Test
    @DisplayName("M03 §6 · without -Xlint:unchecked the varargs warnings fold into the unchecked summary note")
    void compile_reportsOnlyTheSummaryNote_whenLintIsOff() {
        InMemoryCompiler.Result plain = compile(PLAIN_VARARGS);

        assertThat(plain.success()).isTrue();
        assertThat(warningCodes(plain)).doesNotContain(VARARGS_DECLARATION, VARARGS_CALL);
        assertThat(plain.diagnostics().stream()
                        .filter(d -> d.getKind() == Diagnostic.Kind.NOTE)
                        .map(Diagnostic::getCode))
                .contains(UNCHECKED_NOTE);
    }

    @Test
    @DisplayName("M03 §6 · @SafeVarargs on a non-final instance method does not compile")
    void compile_rejectsSafeVarargs_whenMethodCanBeOverridden() {
        assertThat(compile(SAFE_VARARGS_ON_INSTANCE_METHOD).errorCodes()).contains(INVALID_SAFE_VARARGS);
        assertThat(compile(SAFE_VARARGS_ON_ALLOWED_METHODS).success()).isTrue();
    }

    private static InMemoryCompiler.Result compile(String members, String... options) {
        return InMemoryCompiler.compile(Map.of(SOURCE_NAME, source(members)), options);
    }

    private static String source(String members) {
        return "import java.util.*;\nclass Raw {\n" + members + "\n}\n";
    }

    private static List<String> warningCodes(InMemoryCompiler.Result result) {
        return result.diagnostics().stream()
                .filter(d -> d.getKind() == Diagnostic.Kind.WARNING || d.getKind() == Diagnostic.Kind.MANDATORY_WARNING)
                .map(Diagnostic::getCode)
                .toList();
    }
}
