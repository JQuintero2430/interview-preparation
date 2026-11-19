package dev.interview.javalanguage.m03.s02;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.List;
import java.util.Map;
import javax.tools.Diagnostic;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Diagnostic keys, not message text: javac messages are localized and reworded between releases.
class TypeInferenceCompileRulesTest {

    private static final String SOURCE_NAME = "Raw";
    private static final String LINT = "-Xlint:rawtypes,unchecked";
    private static final String RAW_USE = "compiler.warn.raw.class.use";
    private static final String UNCHECKED = "compiler.warn.prob.found.req";
    private static final String INCOMPATIBLE_TYPES = "compiler.err.prob.found.req";
    private static final String CANNOT_INFER_VAR = "compiler.err.cant.infer.local.var.type";

    private static final String DIAMOND = source("void run() { List<String> names = new ArrayList<>(); }");
    private static final String RAW_CONSTRUCTOR = source("void run() { List<String> names = new ArrayList(); }");
    private static final String DIAMOND_ARGUMENT =
            source("void take(List<String> names) {} void run() { take(new ArrayList<>()); }");
    private static final String VAR_DIAMOND_MIXED_ADDS =
            source("void run() { var list = new ArrayList<>(); list.add(\"a\"); list.add(1); }");
    private static final String VAR_DIAMOND_STRING_READ =
            source("void run() { var list = new ArrayList<>(); list.add(\"a\"); String s = list.get(0); }");
    private static final String VAR_EXPLICIT_STRING_READ =
            source("void run() { var list = new ArrayList<String>(); list.add(\"a\"); String s = list.get(0); }");
    private static final String CHAIN_WITHOUT_WITNESS =
            source("String run() { return Collections.emptyList().get(0); }");
    private static final String CHAIN_WITH_WITNESS =
            source("String run() { return Collections.<String>emptyList().get(0); }");
    private static final String VAR_REASSIGNED = source("void run() { var port = \"8080\"; port = 8080; }");
    private static final String VAR_WITHOUT_INITIALIZER = source("void run() { var port; }");
    private static final String VAR_NULL = source("void run() { var port = null; }");
    private static final String UNCHECKED_GETTER = source("""
            Map<String, Object> values = new HashMap<>();
            <T> T get(String key) { return (T) values.get(key); }
            void run() { Integer port = get("port"); }
            """);
    private static final String SUPPRESSED_GETTER = source("""
            Map<String, Object> values = new HashMap<>();
            @SuppressWarnings("unchecked")
            <T> T get(String key) { return (T) values.get(key); }
            void run() { Integer port = get("port"); }
            """);

    @Test
    @DisplayName("M03 §2 · the diamond infers the type arguments and is not a raw type")
    void compile_warnsOnlyForTheRawConstructor_whenComparedWithTheDiamond() {
        var diamond = compileWithLint(DIAMOND);
        var raw = compileWithLint(RAW_CONSTRUCTOR);

        assertThat(diamond.success()).isTrue();
        assertThat(warningCodes(diamond)).isEmpty();
        assertThat(raw.success()).isTrue();
        assertThat(warningCodes(raw)).contains(RAW_USE, UNCHECKED);
    }

    @Test
    @DisplayName("M03 §2 · an argument position is a target type for the diamond")
    void compile_succeedsWithoutWarnings_whenDiamondIsAMethodArgument() {
        var result = compileWithLint(DIAMOND_ARGUMENT);

        assertThat(result.success()).isTrue();
        assertThat(warningCodes(result)).isEmpty();
    }

    @Test
    @DisplayName("M03 §2 · var with a diamond infers ArrayList<Object>")
    void compile_infersObjectElements_whenVarIsInitializedWithADiamond() {
        assertThat(compile(VAR_DIAMOND_MIXED_ADDS).success()).isTrue();
        assertThat(compile(VAR_DIAMOND_STRING_READ).errorCodes()).contains(INCOMPATIBLE_TYPES);
        assertThat(compile(VAR_EXPLICIT_STRING_READ).success()).isTrue();
    }

    @Test
    @DisplayName("M03 §2 · a type witness selects T where inference cannot")
    void compile_succeedsOnlyWithATypeWitness_whenTheCallIsAReceiverInAChain() {
        assertThat(compile(CHAIN_WITHOUT_WITNESS).errorCodes()).contains(INCOMPATIBLE_TYPES);
        assertThat(compile(CHAIN_WITH_WITNESS).success()).isTrue();
    }

    @Test
    @DisplayName("M03 §2 · var fixes the static type at the declaration")
    void compile_fails_whenVarIsReassignedToAnotherTypeOrHasNoTypedInitializer() {
        assertThat(compile(VAR_REASSIGNED).errorCodes()).contains(INCOMPATIBLE_TYPES);
        assertThat(compile(VAR_WITHOUT_INITIALIZER).errorCodes()).contains(CANNOT_INFER_VAR);
        assertThat(compile(VAR_NULL).errorCodes()).contains(CANNOT_INFER_VAR);
    }

    @Test
    @DisplayName("M03 §2 · the unchecked cast in a <T> T getter warns at the getter and never at the caller")
    void compile_warnsOnceAtTheGetter_whenTheGetterCastsToItsTypeParameter() {
        var unchecked = compileWithLint(UNCHECKED_GETTER);
        var suppressed = compileWithLint(SUPPRESSED_GETTER);

        assertThat(unchecked.success()).isTrue();
        assertThat(warningCodes(unchecked)).containsExactly(UNCHECKED);
        assertThat(suppressed.success()).isTrue();
        assertThat(warningCodes(suppressed)).isEmpty();
    }

    private static String source(String members) {
        return "import java.util.*;\nclass Raw {\n" + members + "\n}\n";
    }

    private static InMemoryCompiler.Result compile(String source) {
        return InMemoryCompiler.compile(Map.of(SOURCE_NAME, source));
    }

    private static InMemoryCompiler.Result compileWithLint(String source) {
        return InMemoryCompiler.compile(Map.of(SOURCE_NAME, source), LINT);
    }

    private static List<String> warningCodes(InMemoryCompiler.Result result) {
        return result.diagnostics().stream()
                .filter(d -> d.getKind() == Diagnostic.Kind.WARNING || d.getKind() == Diagnostic.Kind.MANDATORY_WARNING)
                .map(Diagnostic::getCode)
                .toList();
    }
}
