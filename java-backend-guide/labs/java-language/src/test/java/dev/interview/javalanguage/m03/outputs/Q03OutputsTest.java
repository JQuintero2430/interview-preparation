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

    private static final String ADD_DEFAULTS_EXTENDS = "void addDefaults(List<? extends Number> list) { list.add(0); }";
    private static final String ADD_DEFAULTS_SUPER = "void addDefaults(List<? super Integer> list) { list.add(0); }";
    private static final String NOT_REIFIABLE = "compiler.err.instanceof.reifiable.not.safe";
    private static final String EVENTS = "interface Event {}\nrecord OrderPlaced() implements Event {}\n";
    private static final String INVARIANT_PUBLISH = "static void publishAll(List<Event> events) { }";
    private static final String COVARIANT_PUBLISH = "static void publishAll(List<? extends Event> events) { }";
    private static final String PUBLISH_ORDERS = "void run(List<OrderPlaced> placed) { publishAll(placed); }";

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

    @Test
    @DisplayName("Q03.09 · String[] is an Object[], and storing an Integer throws ArrayStoreException naming Integer")
    void main_printsArrayTypeAndStoreFailure_whenArrayIsCovariant() {
        List<String> lines = OutputCapture.linesOf(() -> Q03_09.main(new String[0]));

        assertThat(lines).containsExactly("String[]", "ArrayStoreException: java.lang.Integer");
    }

    @Test
    @DisplayName("Q03.09 · List<Integer> is not a List<Number>, but it is a List<? extends Number>")
    void compile_rejectsInvariantAssignment_whenElementTypesDiffer() {
        assertThat(compileBody("List<Number> n = new ArrayList<Integer>();").errorCodes())
                .containsExactly(INCOMPATIBLE);
        assertThat(compileBody("List<? extends Number> n = new ArrayList<Integer>();")
                        .success())
                .isTrue();
    }

    @Test
    @DisplayName("Q03.11 · add(0) on List<? extends Number> does not compile, on List<? super Integer> it does")
    void compile_rejectsAddThroughExtendsWildcard_whenElementTypeIsUnknown() {
        assertThat(compileMembers(ADD_DEFAULTS_EXTENDS).errorCodes()).containsExactly(INCOMPATIBLE);
        assertThat(compileMembers(ADD_DEFAULTS_SUPER).success()).isTrue();
    }

    @Test
    @DisplayName("Q03.12 · a List<String> fits List<?> and raw List, not List<Object>")
    void compile_acceptsListOfStringOnlyForWildcardAndRaw_whenAssigning() {
        String strings = "List<String> s = new ArrayList<>();\n";

        assertThat(compileBody(strings + "List<?> any = s;").success()).isTrue();
        assertThat(compileBody(strings + "List<Object> objects = s;").errorCodes())
                .containsExactly(INCOMPATIBLE);
        assertThat(compileBody(strings + "List raw = s;").success()).isTrue();
    }

    @Test
    @DisplayName("Q03.12 · List<Object> and raw List accept an Integer, List<?> accepts only null")
    void compile_acceptsWritesOnlyForObjectAndRaw_whenAddingAnInteger() {
        assertThat(compileBody("List<?> any = new ArrayList<String>(); any.add(1);")
                        .errorCodes())
                .containsExactly(INCOMPATIBLE);
        assertThat(compileBody("List<?> any = new ArrayList<String>(); any.add(null);")
                        .success())
                .isTrue();
        assertThat(compileBody("List<Object> objects = new ArrayList<>(); objects.add(1);")
                        .success())
                .isTrue();
        InMemoryCompiler.Result raw = compileBody("List raw = new ArrayList<String>(); raw.add(1);", LINT);
        assertThat(raw.success()).isTrue();
        assertThat(warningCodes(raw)).contains(RAW_USE, UNCHECKED_CALL);
    }

    @Test
    @DisplayName("Q03.13 · publishAll(List<Event>) rejects a List<OrderPlaced>, List<? extends Event> accepts it")
    void compile_acceptsSubtypeListOnlyWithExtendsWildcard_whenLibraryTakesEvents() {
        assertThat(compileMembers(EVENTS + INVARIANT_PUBLISH + PUBLISH_ORDERS).errorCodes())
                .containsExactly(INCOMPATIBLE);
        assertThat(compileMembers(EVENTS + COVARIANT_PUBLISH + PUBLISH_ORDERS).success())
                .isTrue();
    }

    @Test
    @DisplayName("Q03.13 · List<Event> and List<? extends Event> parameters have the same erasure")
    void erasure_isTheSame_whenOnlyTheWildcardChanges() throws Exception {
        InMemoryCompiler.Result invariant = compileMembers(EVENTS + INVARIANT_PUBLISH);
        InMemoryCompiler.Result covariant = compileMembers(EVENTS + COVARIANT_PUBLISH);

        assertThat(publishAllParameters(invariant)).isEqualTo(publishAllParameters(covariant));
    }

    @Test
    @DisplayName("Q03.15 · both lists have the class ArrayList; instanceof List<?> and ArrayList<String> are true")
    void main_printsSameClassAndTwoTrueChecks_whenTypeArgumentsAreErased() {
        List<String> lines = OutputCapture.linesOf(() -> Q03_15.main(new String[0]));

        assertThat(lines).containsExactly("true", "java.util.ArrayList", "true", "true");
    }

    @Test
    @DisplayName("Q03.15 · instanceof List<String> or List<Object> on an Object does not compile, raw List does")
    void compile_rejectsInstanceofWithTypeArgument_whenOperandIsObject() {
        assertThat(compileBody("Object o = new ArrayList<String>(); boolean b = o instanceof List<String>;")
                        .errorCodes())
                .containsExactly(NOT_REIFIABLE);
        assertThat(compileBody("Object o = new ArrayList<String>(); boolean b = o instanceof List<Object>;")
                        .errorCodes())
                .containsExactly(NOT_REIFIABLE);
        assertThat(compileBody("Object o = new ArrayList<String>(); boolean b = o instanceof List;")
                        .success())
                .isTrue();
    }

    @Test
    @DisplayName("Q03.16 · Money declares compareTo(Money) and a synthetic bridge compareTo(Object)")
    void main_printsDeclaredMethodsSorted_whenRecordImplementsComparableOfItself() {
        List<String> lines = OutputCapture.linesOf(() -> Q03_16.main(new String[0]));

        assertThat(lines)
                .containsExactly(
                        "cents()",
                        "compareTo(Money)",
                        "compareTo(Object) bridge synthetic",
                        "equals(Object)",
                        "hashCode()",
                        "toString()");
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

    private static List<Class<?>> publishAllParameters(InMemoryCompiler.Result result) throws Exception {
        assertThat(result.success()).isTrue();
        return List.of(result.load(SOURCE_NAME)
                .getDeclaredMethod("publishAll", List.class)
                .getParameterTypes());
    }

    private static List<String> warningCodes(InMemoryCompiler.Result result) {
        return result.diagnostics().stream()
                .filter(d -> d.getKind() == Diagnostic.Kind.MANDATORY_WARNING || d.getKind() == Diagnostic.Kind.WARNING)
                .map(Diagnostic::getCode)
                .toList();
    }
}
