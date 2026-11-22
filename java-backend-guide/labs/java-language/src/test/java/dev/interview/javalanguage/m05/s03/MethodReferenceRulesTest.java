package dev.interview.javalanguage.m05.s03;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Only the top-level diagnostic key is asserted; javac nests the reason (ambiguity, arity) inside it.
class MethodReferenceRulesTest {

    private static final String SOURCE_NAME = "Refs";
    private static final String INCOMPATIBLE_TYPES = "compiler.err.prob.found.req";
    private static final String THIS_IN_STATIC_CONTEXT = "compiler.err.non-static.cant.be.ref";

    private static final String AMBIGUOUS_TO_STRING = """
            import java.util.function.Function;
            class Refs { Function<Integer, String> text = Integer::toString; }
            """;
    private static final String UNBOUND_AS_SUPPLIER = """
            import java.util.function.Supplier;
            class Refs { String name() { return "r"; } Supplier<String> s = Refs::name; }
            """;
    private static final String BOUND_AS_FUNCTION = """
            import java.util.function.Function;
            class Refs { String name() { return "r"; } Function<Refs, String> f = this::name; }
            """;
    private static final String THIS_IN_STATIC_METHOD = """
            import java.util.function.Supplier;
            class Refs { String name() { return "r"; } static Supplier<String> make() { return this::name; } }
            """;
    private static final String EVERY_KIND = """
            import java.util.ArrayList;
            import java.util.Comparator;
            import java.util.List;
            import java.util.function.Function;
            import java.util.function.IntFunction;
            import java.util.function.Supplier;
            import java.util.function.ToIntFunction;
            class Refs {
                String name() { return "r"; }
                Function<String, Integer> parse = Integer::parseInt;
                Function<String, String> prefix = "id-"::concat;
                ToIntFunction<String> length = String::length;
                Comparator<String> ignoreCase = String::compareToIgnoreCase;
                Function<Refs, String> unbound = Refs::name;
                Supplier<String> bound = this::name;
                Supplier<List<String>> list = ArrayList::new;
                IntFunction<int[]> array = int[]::new;
            }
            """;

    @Test
    @DisplayName("M05 §3 · Integer::toString is ambiguous as a Function<Integer, String>")
    void compile_fails_whenStaticAndUnboundFormsBothApply() {
        assertThat(errorCodes(AMBIGUOUS_TO_STRING)).containsExactly(INCOMPATIBLE_TYPES);
    }

    @Test
    @DisplayName("M05 §3 · ClassName::instanceMethod needs the receiver as an argument")
    void compile_fails_whenUnboundReferenceHasNoReceiverArgument() {
        assertThat(errorCodes(UNBOUND_AS_SUPPLIER)).containsExactly(INCOMPATIBLE_TYPES);
    }

    @Test
    @DisplayName("M05 §3 · this::instanceMethod already has its receiver")
    void compile_fails_whenBoundReferenceIsGivenAReceiverParameter() {
        assertThat(errorCodes(BOUND_AS_FUNCTION)).containsExactly(INCOMPATIBLE_TYPES);
    }

    @Test
    @DisplayName("M05 §3 · this::method is not allowed in a static method")
    void compile_fails_whenThisReferenceIsInStaticContext() {
        assertThat(errorCodes(THIS_IN_STATIC_METHOD)).containsExactly(THIS_IN_STATIC_CONTEXT);
    }

    @Test
    @DisplayName("M05 §3 · static, bound, unbound, constructor and array-constructor references compile")
    void compile_succeeds_forEveryKind() {
        assertThat(InMemoryCompiler.compile(Map.of(SOURCE_NAME, EVERY_KIND)).success())
                .isTrue();
    }

    private static List<String> errorCodes(String source) {
        return InMemoryCompiler.compile(Map.of(SOURCE_NAME, source)).errorCodes();
    }
}
