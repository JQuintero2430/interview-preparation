package dev.interview.javalanguage.m01.outputs;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import dev.interview.javalanguage.m01.support.OutputCapture;
import java.io.Serializable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.util.List;
import java.util.Map;
import java.util.RandomAccess;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// The printed lines and the compile outcome are the claims the guide makes, so the expected values stay literal.
class Q01InheritanceOutputsTest {

    private static final String REF_AMBIGUOUS = "compiler.err.ref.ambiguous";
    private static final String PROB_FOUND_REQ = "compiler.err.prob.found.req";
    private static final String TYPES_INCOMPATIBLE = "compiler.err.types.incompatible";
    private static final String TWO_DEFAULTS_SOURCE = "interface L { default String h() { return \"l\"; } }"
            + " interface R { default String h() { return \"r\"; } }"
            + " class C implements L, R {}";
    private static final String DEFAULT_AND_ABSTRACT_SOURCE = "interface L { default String h() { return \"l\"; } }"
            + " interface R { String h(); }"
            + " abstract class C implements L, R {}";
    private static final String PRIMITIVE_RETURN_SOURCE =
            "class A { int m() { return 1; } } class B extends A { long m() { return 2L; } }";
    private static final String PRIVATE_OVERRIDE_SOURCE =
            "class A { private void m() {} } class B extends A { @Override void m() {} }";
    private static final String NARROWER_THROWS_SOURCE = "class A { void m() throws Exception {} }"
            + " class B extends A { @Override void m() throws java.io.IOException {} }";
    private static final String DEFAULT_EQUALS_SOURCE =
            "interface I { default boolean equals(Object o) { return true; } }";
    private static final String MISSING_MARKER_SOURCE = "interface Marker {} class Plain {}"
            + " class A { static void take(Marker m) {} static void call() { take(new Plain()); } }";
    private static final String NULL_OVERLOADS_SOURCE = "class A {"
            + " static String m(Integer i) { return \"Integer\"; }"
            + " static String m(Object o) { return \"Object\"; }"
            + " static String m(int... a) { return \"varargs\"; }"
            + " static String call() { return m(null); } }";

    @Test
    @DisplayName("Q01.17 · inheritance double counts addAll, forwarding counts once")
    void main_printsSixThreeAndThreeThree_whenQ01_17Runs() {
        List<String> lines = OutputCapture.linesOf(() -> Q01_17.main(new String[0]));

        assertThat(lines).containsExactly("6 3", "3 3");
    }

    @Test
    @DisplayName("Q01.18 · fields are hidden by type, static methods by type, instance methods by object")
    void main_printsFieldHidingAndDispatchLines_whenQ01_18Runs() {
        List<String> lines = OutputCapture.linesOf(() -> Q01_18.main(new String[0]));

        assertThat(lines).containsExactly("parent", "child", "parent", "child", "parent");
    }

    @Test
    @DisplayName("Q01.19 · overload resolution runs in three phases")
    void main_printsOverloadChoices_whenQ01_19Runs() {
        List<String> lines = OutputCapture.linesOf(() -> Q01_19.main(new String[0]));

        assertThat(lines).containsExactly("long", "Integer", "Object", "varargs", "varargs");
    }

    @Test
    @DisplayName("Q01.19 · null with Integer and int... overloads is ambiguous")
    void compile_reportsRefAmbiguous_whenNullIsPassedToIntegerAndIntVarargsOverloads() {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(Map.of("A", NULL_OVERLOADS_SOURCE));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(REF_AMBIGUOUS);
    }

    @Test
    @DisplayName("Q01.23 · explicit super calls, shared ancestor and more specific override")
    void main_printsThreeLines_whenQ01_23Runs() {
        List<String> lines = OutputCapture.linesOf(() -> Q01_23.main(new String[0]));

        assertThat(lines).containsExactly("left+right", "root", "over");
    }

    @Test
    @DisplayName("Q01.23 · two unrelated defaults without override do not compile")
    void compile_reportsTypesIncompatible_whenTwoUnrelatedDefaultsAreNotOverridden() {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(Map.of("C", TWO_DEFAULTS_SOURCE));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(TYPES_INCOMPATIBLE);
    }

    @Test
    @DisplayName("Q01.23 · a default and an unrelated abstract method of the same signature do not compile")
    void compile_reportsTypesIncompatible_whenDefaultMeetsUnrelatedAbstractMethod() {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(Map.of("C", DEFAULT_AND_ABSTRACT_SOURCE));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(TYPES_INCOMPATIBLE);
    }

    @Test
    @DisplayName("Q01.20 · an override cannot change a primitive return type")
    void compile_reportsIncompatibleReturn_whenOverrideChangesPrimitiveReturnType() {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(Map.of("A", PRIMITIVE_RETURN_SOURCE));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly("compiler.err.override.incompatible.ret");
    }

    @Test
    @DisplayName("Q01.20 · @Override on the name of a private superclass method does not compile")
    void compile_reportsDoesNotOverride_whenOverrideTargetsPrivateSuperclassMethod() {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(Map.of("A", PRIVATE_OVERRIDE_SOURCE));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly("compiler.err.method.does.not.override.superclass");
    }

    @Test
    @DisplayName("Q01.20 · an override may declare a narrower checked exception")
    void compile_succeeds_whenOverrideDeclaresNarrowerCheckedException() {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(Map.of("A", NARROWER_THROWS_SOURCE));

        assertThat(result.success()).isTrue();
    }

    @Test
    @DisplayName("Q01.22 · a default method cannot redeclare equals(Object)")
    void compile_reportsDefaultOverridesObjectMember_whenDefaultRedeclaresEquals() {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(Map.of("I", DEFAULT_EQUALS_SOURCE));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly("compiler.err.default.overrides.object.member");
    }

    @Test
    @DisplayName("Q01.24 · an object lacking the marker interface is rejected by a method taking the marker")
    void compile_reportsProbFoundReq_whenObjectLacksMarkerInterface() {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(Map.of("A", MISSING_MARKER_SOURCE));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(PROB_FOUND_REQ);
    }

    @Test
    @DisplayName("Q01.24 · only a RUNTIME-retained annotation is visible through reflection")
    void isAnnotationPresent_isTrueOnlyForRuntimeRetention_whenMarkerAnnotationsAreRead() {
        assertThat(RuntimeMarked.class.isAnnotationPresent(RuntimeMarker.class)).isTrue();
        assertThat(ClassMarked.class.isAnnotationPresent(ClassMarker.class)).isFalse();
    }

    @Test
    @DisplayName("Q01.24 · Serializable, Cloneable and RandomAccess declare no methods")
    void getDeclaredMethods_isEmpty_whenReadOnJdkMarkerInterfaces() {
        assertThat(Serializable.class.getDeclaredMethods()).isEmpty();
        assertThat(Cloneable.class.getDeclaredMethods()).isEmpty();
        assertThat(RandomAccess.class.getDeclaredMethods()).isEmpty();
    }

    @Retention(RetentionPolicy.RUNTIME)
    @interface RuntimeMarker {}

    @interface ClassMarker {}

    @RuntimeMarker
    static class RuntimeMarked {}

    @ClassMarker
    static class ClassMarked {}
}
