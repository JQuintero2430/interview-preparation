package dev.interview.javalanguage.m05.s01;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Diagnostic keys, not message text: javac messages are localized and reworded between releases.
class FunctionalInterfaceRulesTest {

    private static final String SOURCE_NAME = "Shapes";
    private static final String BAD_ANNOTATION = "compiler.err.bad.functional.intf.anno.1";
    private static final String INCOMPATIBLE_TYPES = "compiler.err.prob.found.req";
    private static final String ALREADY_DEFINED = "compiler.err.already.defined";
    private static final String CANNOT_INFER_VAR = "compiler.err.cant.infer.local.var.type";

    private static final String TWO_ABSTRACT_METHODS = """
            @FunctionalInterface
            interface Shapes { void open(); void close(); }
            """;
    private static final String OBJECT_DEFAULT_AND_STATIC_MEMBERS = """
            @FunctionalInterface
            interface Check<T> {
                boolean test(T value);
                boolean equals(Object other);
                String toString();
                default Check<T> negate() { return value -> !test(value); }
                static <T> Check<T> always() { return value -> true; }
            }
            class Shapes { Check<String> empty = s -> s.isEmpty(); }
            """;
    private static final String SEALED_INTERFACE = """
            sealed interface Rule permits Identity { int apply(int x); }
            final class Identity implements Rule { public int apply(int x) { return x; } }
            class Shapes { Rule rule = x -> x; }
            """;
    private static final String PUBLIC_CLONE = """
            interface Copyable { int size(); Object clone(); }
            class Shapes { Copyable c = () -> 1; }
            """;
    private static final String LAMBDA_PARAMETER_REDECLARES_LOCAL = """
            import java.util.function.IntUnaryOperator;
            class Shapes {
                void run() {
                    int x = 1;
                    IntUnaryOperator next = x -> x + 1;
                }
            }
            """;
    private static final String VAR_WITH_LAMBDA = """
            class Shapes { void run() { var same = (String s) -> s; } }
            """;
    private static final String OBJECT_AS_TARGET = """
            class Shapes { void run() { Object task = () -> {}; } }
            """;
    private static final String ONE_LAMBDA_TWO_TARGETS = """
            import java.util.concurrent.Callable;
            import java.util.function.Supplier;
            class Shapes {
                Supplier<String> supplier = () -> "ready";
                Callable<String> callable = () -> "ready";
            }
            """;

    @Test
    @DisplayName("M05 §1 · @FunctionalInterface rejects an interface with two abstract methods")
    void compile_fails_whenAnnotatedInterfaceHasTwoAbstractMethods() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, TWO_ABSTRACT_METHODS));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(BAD_ANNOTATION);
    }

    @Test
    @DisplayName("M05 §1 · Object methods, defaults and statics do not count against the single abstract method")
    void compile_succeeds_whenOnlyOneAbstractMethodIsNotFromObject() {
        var result = InMemoryCompiler.compile(Map.of("Check", OBJECT_DEFAULT_AND_STATIC_MEMBERS));

        assertThat(result.success()).isTrue();
    }

    @Test
    @DisplayName("M05 §1 · a sealed interface with one abstract method is not functional")
    void compile_fails_whenLambdaTargetsSealedInterface() {
        var result = InMemoryCompiler.compile(Map.of("Rule", SEALED_INTERFACE));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(INCOMPATIBLE_TYPES);
    }

    @Test
    @DisplayName("M05 §1 · a public clone() declaration counts as a second abstract method")
    void compile_fails_whenInterfaceRedeclaresCloneAsPublic() {
        var result = InMemoryCompiler.compile(Map.of("Copyable", PUBLIC_CLONE));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(INCOMPATIBLE_TYPES);
    }

    @Test
    @DisplayName("M05 §1 · a lambda parameter cannot redeclare a local of the enclosing method")
    void compile_fails_whenLambdaParameterShadowsLocal() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, LAMBDA_PARAMETER_REDECLARES_LOCAL));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(ALREADY_DEFINED);
    }

    @Test
    @DisplayName("M05 §1 · var cannot be the target type of a lambda")
    void compile_fails_whenVarIsInitializedWithLambda() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, VAR_WITH_LAMBDA));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(CANNOT_INFER_VAR);
    }

    @Test
    @DisplayName("M05 §1 · Object is not a functional interface, so it cannot type a lambda")
    void compile_fails_whenLambdaIsAssignedToObject() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, OBJECT_AS_TARGET));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(INCOMPATIBLE_TYPES);
    }

    @Test
    @DisplayName("M05 §1 · the same lambda text compiles against two different functional interfaces")
    void compile_succeeds_whenSameLambdaTargetsSupplierAndCallable() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, ONE_LAMBDA_TWO_TARGETS));

        assertThat(result.success()).isTrue();
    }
}
