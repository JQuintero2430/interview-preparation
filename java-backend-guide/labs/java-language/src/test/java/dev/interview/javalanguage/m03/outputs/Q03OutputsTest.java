package dev.interview.javalanguage.m03.outputs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import dev.interview.javalanguage.m01.support.OutputCapture;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import javax.tools.Diagnostic;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// The printed lines, exceptions and diagnostic keys are the claims the guide makes, so the expected values stay
// literal.
class Q03OutputsTest {

    private static final String SOURCE_NAME = "Probe";
    private static final String LINT = "-Xlint:rawtypes,unchecked";
    private static final String RAW_USE = "compiler.warn.raw.class.use";
    private static final String UNCHECKED_CALL = "compiler.warn.unchecked.call.mbr.of.raw.type";
    private static final String UNCHECKED_ASSIGN = "compiler.warn.prob.found.req";
    private static final String INCOMPATIBLE = "compiler.err.prob.found.req";
    private static final String CANNOT_APPLY = "compiler.err.cant.apply.symbol";

    private static final String Q03_02_BODY = """
            List raw = new ArrayList();
            raw.add("sku-1");
            raw.add(42);
            List<String> skus = raw;
            """;
    private static final String Q03_05_DECLARATIONS = """
            List<String> a = new ArrayList<>();
            var b = new ArrayList<>();
            var c = new ArrayList<String>();
            """;
    private static final String Q03_05_CHAIN = "List<String> e = Collections.emptyList().stream().toList();";
    private static final String Q03_05_WITNESS = "List<String> e = Collections.<String>emptyList().stream().toList();";
    private static final String STRICT_MAX = "static <T extends Comparable<T>> T max(List<T> v) { return v.get(0); }";
    private static final String SUPER_MAX =
            "static <T extends Comparable<? super T>> T max(List<T> v) { return v.get(0); }";
    private static final String MAX_OF_DATES = "LocalDate run(List<LocalDate> d) { return max(d); }";
    private static final String MAX_OF_INTEGERS = "Integer run(List<Integer> n) { return max(n); }";

    @Test
    @DisplayName("Q03.02 · prints 2 and sku-1, then the typed read of the Integer throws ClassCastException")
    void main_printsTwoLinesThenThrows_whenTypedReadMeetsTheInteger() {
        AtomicReference<RuntimeException> thrown = new AtomicReference<>();

        List<String> lines = OutputCapture.linesOf(() -> runCatching(() -> Q03_02.main(new String[0]), thrown));

        assertThat(lines).containsExactly("2", "sku-1");
        assertThat(thrown.get())
                .isInstanceOf(ClassCastException.class)
                .hasMessageContaining("java.lang.Integer")
                .hasMessageContaining("java.lang.String");
    }

    @Test
    @DisplayName("Q03.02 · reading the same element into an Object variable does not throw")
    void untypedRead_returnsTheInteger_whenTargetIsObject() {
        assertThat(Q03_02.untypedRead()).isEqualTo(42);
    }

    @Test
    @DisplayName("Q03.02 · it compiles with two rawtypes, two unchecked-call and one unchecked-assignment warnings")
    void compile_succeedsWithFiveWarnings_whenRawListFeedsATypedList() {
        InMemoryCompiler.Result result = compileBody(Q03_02_BODY, LINT);

        assertThat(result.success()).isTrue();
        assertThat(warningCodes(result))
                .containsExactly(RAW_USE, RAW_USE, UNCHECKED_CALL, UNCHECKED_CALL, UNCHECKED_ASSIGN);
    }

    @Test
    @DisplayName("Q03.05 · var with a diamond is ArrayList<Object>, the declared target makes ArrayList<String>")
    void main_printsMixedListAndCopiedStrings_whenInferenceDiffersByDeclaration() {
        List<String> lines = OutputCapture.linesOf(() -> Q03_05.main(new String[0]));

        assertThat(lines).containsExactly("[1, two]", "[three] 0 []");
    }

    @Test
    @DisplayName("Q03.05 · reading b as String and adding an int to a or c do not compile")
    void compile_rejectsWrongTypes_whenInferredTypesAreUsed() {
        assertThat(compileBody(Q03_05_DECLARATIONS + "String s = b.get(0);").errorCodes())
                .containsExactly(INCOMPATIBLE);
        assertThat(compileBody(Q03_05_DECLARATIONS + "a.add(1);").errorCodes()).containsExactly(INCOMPATIBLE);
        assertThat(compileBody(Q03_05_DECLARATIONS + "c.add(1);").errorCodes()).containsExactly(INCOMPATIBLE);
        assertThat(compileBody(Q03_05_DECLARATIONS + "b.add(1); b.add(\"x\");").success())
                .isTrue();
    }

    @Test
    @DisplayName("Q03.05 · a chained call gets no target type: it needs a type witness")
    void compile_needsWitness_whenGenericCallIsAReceiver() {
        assertThat(compileBody(Q03_05_CHAIN).errorCodes()).containsExactly(INCOMPATIBLE);
        assertThat(compileBody(Q03_05_WITNESS).success()).isTrue();
    }

    @Test
    @DisplayName("Q03.06 · the ClassCastException is thrown in the caller's frame, not in get")
    void main_throwsInCallerFrame_whenTargetTypeDisagreesWithStoredValue() {
        assertThatThrownBy(() -> Q03_06.main(new String[0]))
                .isInstanceOf(ClassCastException.class)
                .satisfies(e -> assertThat(e.getStackTrace()[0].getClassName()).isEqualTo(Q03_06.class.getName()));
    }

    @Test
    @DisplayName("Q03.06 · an Object target does not throw, String.valueOf picks valueOf(char[]) and throws")
    void get_dependsOnTargetType_whenOnlyTheReturnTypeMentionsT() {
        assertThat(Q03_06.asObject()).isEqualTo("8080");
        assertThatThrownBy(Q03_06::throughValueOf)
                .isInstanceOf(ClassCastException.class)
                .hasMessageContaining("[C");
        assertThat(Q03_06.checked()).isEqualTo("8080");
    }

    @Test
    @DisplayName(
            "Q03.08 · Comparable<T> rejects List<LocalDate>, Comparable<? super T> accepts it; both accept Integer")
    void compile_acceptsLocalDateOnlyWithSuperWildcard_whenComparableIsInherited() {
        assertThat(compileMembers(STRICT_MAX + MAX_OF_DATES).errorCodes()).containsExactly(CANNOT_APPLY);
        assertThat(compileMembers(STRICT_MAX + MAX_OF_INTEGERS).success()).isTrue();
        assertThat(compileMembers(SUPER_MAX + MAX_OF_DATES).success()).isTrue();
        assertThat(compileMembers(SUPER_MAX + MAX_OF_INTEGERS).success()).isTrue();
    }

    @Test
    @DisplayName("Q03.08 · the ? super T version returns the latest LocalDate and the largest Integer")
    void main_printsLatestDateAndLargestInteger_whenBoundUsesSuperWildcard() {
        List<String> lines = OutputCapture.linesOf(() -> Q03_08.main(new String[0]));

        assertThat(lines).containsExactly("2026-03-09", "7");
        assertThat(Q03_08.latest(List.of(LocalDate.of(2026, 1, 1)))).isEqualTo(LocalDate.of(2026, 1, 1));
    }

    private static void runCatching(Runnable action, AtomicReference<RuntimeException> thrown) {
        try {
            action.run();
        } catch (RuntimeException e) {
            thrown.set(e);
        }
    }

    private static InMemoryCompiler.Result compileBody(String body, String... options) {
        return compileMembers("void run() {\n" + body + "\n}", options);
    }

    private static InMemoryCompiler.Result compileMembers(String members, String... options) {
        String source = "import java.util.*;\nimport java.time.LocalDate;\nclass Probe {\n" + members + "\n}\n";
        return InMemoryCompiler.compile(Map.of(SOURCE_NAME, source), options);
    }

    private static List<String> warningCodes(InMemoryCompiler.Result result) {
        return result.diagnostics().stream()
                .filter(d -> d.getKind() == Diagnostic.Kind.MANDATORY_WARNING || d.getKind() == Diagnostic.Kind.WARNING)
                .map(Diagnostic::getCode)
                .toList();
    }
}
