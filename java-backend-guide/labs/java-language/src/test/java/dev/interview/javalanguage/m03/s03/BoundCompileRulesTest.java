package dev.interview.javalanguage.m03.s03;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Diagnostic keys, not message text: javac messages are localized and reworded between releases.
class BoundCompileRulesTest {

    private static final String SOURCE_NAME = "Raw";
    private static final String CANNOT_APPLY = "compiler.err.cant.apply.symbol";
    private static final String INTERFACE_EXPECTED = "compiler.err.intf.expected.here";
    private static final String SYNTAX_ERROR = "compiler.err.expected";
    private static final String CANNOT_RESOLVE = "compiler.err.cant.resolve.location.args";

    private static final String STRICT_MAX = "static <T extends Comparable<T>> T max(List<T> v) { return v.get(0); }";
    private static final String SUPER_MAX =
            "static <T extends Comparable<? super T>> T max(List<T> v) { return v.get(0); }";
    private static final String MAX_OF_DATES =
            "java.time.LocalDate run(List<java.time.LocalDate> dates) { return max(dates); }";
    private static final String MAX_OF_TIMESTAMPS =
            "java.sql.Timestamp run(List<java.sql.Timestamp> stamps) { return max(stamps); }";
    private static final String INTERFACE_FIRST = "static <T extends Comparable<T> & Number> T f(T t) { return t; }";
    private static final String CLASS_FIRST = "static <T extends Number & Comparable<T>> T f(T t) { return t; }";
    private static final String LOWER_BOUND = "static <T super Integer> void f(T t) { }";
    private static final String SUM_OF_STRINGS = """
            static <T extends Number> double sum(List<T> v) { return 0; }
            double run(List<String> names) { return sum(names); }
            """;
    private static final String UNBOUNDED_CALL = "static <T> double f(T t) { return t.doubleValue(); }";
    private static final String BOUNDED_CALL = "static <T extends Number> double f(T t) { return t.doubleValue(); }";

    @Test
    @DisplayName(
            "M03 §3 · max(List<LocalDate>) fails with <T extends Comparable<T>> and compiles with Comparable<? super T>")
    void compile_succeedsOnlyWithSuperWildcard_whenElementInheritsItsComparable() {
        assertThat(compile(STRICT_MAX + MAX_OF_DATES).errorCodes()).contains(CANNOT_APPLY);
        assertThat(compile(STRICT_MAX + MAX_OF_TIMESTAMPS).errorCodes()).contains(CANNOT_APPLY);
        assertThat(compile(SUPER_MAX + MAX_OF_DATES).success()).isTrue();
    }

    @Test
    @DisplayName("M03 §3 · a class bound after an interface bound does not compile")
    void compile_fails_whenClassBoundIsNotFirst() {
        assertThat(compile(INTERFACE_FIRST).errorCodes()).contains(INTERFACE_EXPECTED);
        assertThat(compile(CLASS_FIRST).success()).isTrue();
    }

    @Test
    @DisplayName("M03 §3 · a type parameter cannot have a lower bound")
    void compile_fails_whenTypeParameterUsesSuper() {
        var result = compile(LOWER_BOUND);

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).contains(SYNTAX_ERROR);
    }

    @Test
    @DisplayName("M03 §3 · an argument outside the bound is rejected at compile time")
    void compile_fails_whenArgumentTypeIsOutsideTheBound() {
        assertThat(compile(SUM_OF_STRINGS).errorCodes()).contains(CANNOT_APPLY);
    }

    @Test
    @DisplayName("M03 §3 · without a bound the body can call only Object's methods")
    void compile_fails_whenUnboundedTypeVariableCallsANumberMethod() {
        assertThat(compile(UNBOUNDED_CALL).errorCodes()).contains(CANNOT_RESOLVE);
        assertThat(compile(BOUNDED_CALL).success()).isTrue();
    }

    private static String source(String members) {
        return "import java.util.*;\nclass Raw {\n" + members + "\n}\n";
    }

    private static InMemoryCompiler.Result compile(String members) {
        return InMemoryCompiler.compile(Map.of(SOURCE_NAME, source(members)));
    }
}
