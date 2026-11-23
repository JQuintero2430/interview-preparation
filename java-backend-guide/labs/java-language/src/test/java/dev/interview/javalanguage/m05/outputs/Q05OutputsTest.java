package dev.interview.javalanguage.m05.outputs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNullPointerException;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import dev.interview.javalanguage.m01.support.OutputCapture;
import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// The printed lines and diagnostic keys are the claims the guide makes, so the expected values stay literal.
class Q05OutputsTest {

    private static final String SOURCE_NAME = "Probe";
    private static final String INCOMPATIBLE_TYPES = "compiler.err.prob.found.req";
    private static final String CANNOT_INFER_VAR = "compiler.err.cant.infer.local.var.type";

    private static final String INHERITED_ABSTRACT_METHODS = """
            interface X { int m(Iterable<String> arg); }
            interface Y { int m(Iterable<String> arg); }
            interface Z extends X, Y {}
            interface Task extends Runnable {}
            class Probe { Z z = values -> 1; Task task = () -> {}; }
            """;
    private static final String VAR_WITH_UNTYPED_LAMBDA = """
            class Probe { void run() { var f = x -> x; } }
            """;
    private static final String CAST_SUPPLIES_TARGET = """
            class Probe { void run() { Object task = (Runnable) () -> {}; } }
            """;
    private static final String ANONYMOUS_CLASSES = """
            class Probe {
                int count = 1;
                Runnable ignoresOuter() { return new Runnable() { public void run() {} }; }
                Runnable readsOuter() { return new Runnable() { public void run() { count++; } }; }
            }
            """;
    private static final String ABSTRACT_CLASS_TARGET = """
            abstract class Job { abstract void run(); }
            class Probe { Job job = () -> {}; }
            """;

    @Test
    @DisplayName("Q05.01 · an interface that inherits one abstract method, even from two parents, is functional")
    void q05_01_inheritedSingleAbstractMethodIsFunctional() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, INHERITED_ABSTRACT_METHODS));

        assertThat(result.success()).isTrue();
    }

    @Test
    @DisplayName("Q05.02 · var f = x -> x fails with compiler.err.cant.infer.local.var.type")
    void q05_02_varGivesNoTargetType() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, VAR_WITH_UNTYPED_LAMBDA));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(CANNOT_INFER_VAR);
    }

    @Test
    @DisplayName("Q05.02 · a cast to Runnable supplies the target type an Object variable cannot")
    void q05_02_castSuppliesTargetType() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, CAST_SUPPLIES_TARGET));

        assertThat(result.success()).isTrue();
    }

    @Test
    @DisplayName("Q05.03 · a lambda cannot implement an abstract class, even one with a single abstract method")
    void q05_03_abstractClassIsNotATarget() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, ABSTRACT_CLASS_TARGET));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(INCOMPATIBLE_TYPES);
    }

    @Test
    @DisplayName(
            "Q05.03 · javac 25 gives an anonymous class a this$ field only when its body uses the enclosing instance")
    void q05_03_enclosingInstanceFieldOnlyWhenUsed() throws ClassNotFoundException {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, ANONYMOUS_CLASSES));

        assertThat(result.success()).isTrue();
        assertThat(enclosingInstanceFields(result.load("Probe$1"))).isEmpty();
        assertThat(enclosingInstanceFields(result.load("Probe$2"))).hasSize(1);
    }

    @Test
    @DisplayName(
            "Q05.04 · andThen, compose, negate, Predicate.not and an or-then-and chain print 12, 11, 22, false, true, false")
    void q05_04_printsComposedResults() {
        List<String> lines = OutputCapture.linesOf(() -> Q05_04.main(new String[0]));

        assertThat(lines).containsExactly("12", "11", "22", "false", "true", "false");
    }

    @Test
    @DisplayName("Q05.04 · andThen(null) throws NullPointerException when composing, not when applying")
    void q05_04_nullStepFailsAtComposition() {
        Function<Integer, Integer> plusOne = x -> x + 1;

        assertThatNullPointerException().isThrownBy(() -> plusOne.andThen(null));
    }

    @Test
    @DisplayName(
            "Q05.06 · loaders built over a one-element array all return 3; the per-iteration local returns 0, 1, 2")
    void q05_06_sharedHolderVersusFreshLocal() {
        assertThat(Q05_06.run(Q05_06.pageLoadersBuggy(3))).containsExactly(3, 3, 3);
        assertThat(Q05_06.run(Q05_06.pageLoadersFixed(3))).containsExactly(0, 1, 2);
    }

    @Test
    @DisplayName("Q05.06 · an AtomicInteger holder has the same bug: every loader returns 3")
    void q05_06_atomicHolderSharesTheCounterToo() {
        assertThat(Q05_06.run(Q05_06.pageLoadersAtomic(3))).containsExactly(3, 3, 3);
    }

    @Test
    @DisplayName("Q05.08 · the lambda is created and throws when called; the bound reference throws when created")
    void q05_08_printsWhereEachFormThrows() {
        List<String> lines = OutputCapture.linesOf(() -> Q05_08.main(new String[0]));

        assertThat(lines).containsExactly("1: lambda created", "2: lambda call threw", "3: reference creation threw");
    }

    @Test
    @DisplayName("Q05.08 · the reference's NullPointerException comes from Objects.requireNonNull and has no message")
    void q05_08_referenceFailsInRequireNonNull() {
        NullPointerException failure = Q05_08.referenceCreationFailure(null);

        assertThat(failure).isNotNull();
        assertThat(failure.getMessage()).isNull();
        assertThat(failure.getStackTrace()[0].getClassName()).isEqualTo("java.util.Objects");
        assertThat(failure.getStackTrace()[0].getMethodName()).isEqualTo("requireNonNull");
        assertThat(failure.getStackTrace()[1].getMethodName()).isEqualTo("referenceCreationFailure");
    }

    @Test
    @DisplayName("Q05.08 · the lambda's NullPointerException is raised in the lambda body and names the null variable")
    void q05_08_lambdaFailsInsideBody() {
        NullPointerException failure = Q05_08.lambdaCallFailure(null);

        assertThat(failure).isNotNull();
        assertThat(failure.getStackTrace()[0].getMethodName()).startsWith("lambda$");
        assertThat(failure.getMessage()).contains("\"holder\" is null");
    }

    @Test
    @DisplayName("Q05.08 · an unbound Holder::get is created without a receiver and throws when applied to null")
    void q05_08_unboundReferenceFailsAtCall() {
        Function<Q05_08.Holder, String> unbound = Q05_08.Holder::get;

        assertThat(unbound.apply(new Q05_08.Holder("ready"))).isEqualTo("ready");
        assertThatNullPointerException().isThrownBy(() -> unbound.apply(null));
    }

    private static List<String> enclosingInstanceFields(Class<?> type) {
        return Arrays.stream(type.getDeclaredFields())
                .map(Field::getName)
                .filter(name -> name.startsWith("this$"))
                .toList();
    }
}
