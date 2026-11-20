package dev.interview.javalanguage.m03.s08;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Module 03 §8: remove a JDK signature's wildcard and the same call stops compiling. Keys, not message text.
class JdkSignatureCompileRulesTest {

    private static final String SOURCE_NAME = "Calls";
    private static final String CANNOT_APPLY = "compiler.err.cant.apply.symbol";

    private static final String WIDE_FUNCTION =
            "static final Function<CharSequence, ArrayList<String>> NEW_BUCKET = k -> new ArrayList<>();";
    private static final String STRICT_COMPUTE =
            "static <K, V> V computeIfAbsent(Map<K, V> m, K k, Function<K, V> f) { return m.get(k); }";
    private static final String STRICT_COMPUTE_CALL =
            "void run(Map<String, List<String>> m) { computeIfAbsent(m, \"EU\", NEW_BUCKET); }";
    private static final String JDK_COMPUTE_CALL =
            "void run(Map<String, List<String>> m) { m.computeIfAbsent(\"EU\", NEW_BUCKET); }";
    private static final String ANY_COLLECTOR = "static final Collector<Object, ?, String> ANY = Collectors.mapping("
            + "String::valueOf, Collectors.joining(\", \"));";
    private static final String STRICT_COLLECT =
            "static <T, A, R> R collect(Stream<T> s, Collector<T, A, R> c) { return s.collect(c); }";
    private static final String STRICT_COLLECT_CALL = "String run(Stream<Integer> s) { return collect(s, ANY); }";
    private static final String JDK_COLLECT_CALL = "String run(Stream<Integer> s) { return s.collect(ANY); }";

    @Test
    @DisplayName(
            "M03 §8 · computeIfAbsent with Function<K, V> instead of Function<? super K, ? extends V> rejects the call")
    void compile_failsOnlyForInvariantFunction_whenFunctionIsWiderThanKeyAndValue() {
        assertThat(compile(WIDE_FUNCTION + STRICT_COMPUTE + STRICT_COMPUTE_CALL).errorCodes())
                .contains(CANNOT_APPLY);
        assertThat(compile(WIDE_FUNCTION + JDK_COMPUTE_CALL).success()).isTrue();
    }

    @Test
    @DisplayName("M03 §8 · collect with Collector<T, A, R> instead of Collector<? super T, A, R> rejects the call")
    void compile_failsOnlyForInvariantCollector_whenCollectorConsumesASupertype() {
        assertThat(compile(ANY_COLLECTOR + STRICT_COLLECT + STRICT_COLLECT_CALL).errorCodes())
                .contains(CANNOT_APPLY);
        assertThat(compile(ANY_COLLECTOR + JDK_COLLECT_CALL).success()).isTrue();
    }

    private static String source(String members) {
        return "import java.util.*;\nimport java.util.function.*;\nimport java.util.stream.*;\nclass Calls {\n"
                + members + "\n}\n";
    }

    private static InMemoryCompiler.Result compile(String members) {
        return InMemoryCompiler.compile(Map.of(SOURCE_NAME, source(members)));
    }
}
