package dev.interview.javalanguage.m01.s11;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Map;
import javax.lang.model.SourceVersion;
import javax.tools.ToolProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 01 §11 compiler rules against the javac running the tests; the outer-field omission is JDK-8271623.
class NestedTypeCompileRulesTest {

    private static final String NOT_EFFECTIVELY_FINAL_CODE = "compiler.err.cant.ref.non.effectively.final.var";
    private static final String STATIC_IN_INNER_CODE = "compiler.err.icls.cant.have.static.decl";

    private static final String SOURCE_NAME = "T";
    private static final String INNER_BINARY_NAME = "T$I";
    private static final String OUTER_BINARY_NAME = "T";
    private static final String RELEASE_15_OPTION = "15";

    private static final String LOCAL_CLASS_CAPTURES_REASSIGNED = "class T { Runnable f() { int n = 0; n = 1;"
            + " class L implements Runnable { public void run() { System.out.println(n); } }"
            + " return new L(); } }";
    private static final String ANONYMOUS_CLASS_CAPTURES_REASSIGNED = "class T { Runnable f() { int n = 0; n = 1;"
            + " return new Runnable() { public void run() { System.out.println(n); } }; } }";
    private static final String INNER_WITHOUT_OUTER_USE = "class T { class I { int v; } }";
    private static final String SERIALIZABLE_INNER_WITHOUT_OUTER_USE =
            "class T { class I implements java.io.Serializable { int v; } }";
    private static final String INNER_WITH_STATIC_FIELD = "class T { class I { static int counter; } }";

    private static Field[] innerFields(String source) throws ClassNotFoundException {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, source));
        assertThat(result.success()).isTrue();
        return result.load(INNER_BINARY_NAME).getDeclaredFields();
    }

    @Test
    @DisplayName("M01 §11 · capturing a reassigned local does not compile")
    void localClass_doesNotCompile_whenItCapturesAReassignedLocal() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, LOCAL_CLASS_CAPTURES_REASSIGNED));

        assertThat(result.errorCodes()).containsExactly(NOT_EFFECTIVELY_FINAL_CODE);
    }

    @Test
    @DisplayName("M01 §11 · anonymous class cannot capture a reassigned local either")
    void anonymousClass_doesNotCompile_whenItCapturesAReassignedLocal() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, ANONYMOUS_CLASS_CAPTURES_REASSIGNED));

        assertThat(result.errorCodes()).containsExactly(NOT_EFFECTIVELY_FINAL_CODE);
    }

    @Test
    @DisplayName("M01 §11 · inner class that ignores the outer instance has no synthetic outer field")
    void innerClass_hasNoSyntheticOuterField_whenItNeverUsesTheOuterInstance() throws ClassNotFoundException {
        Field[] fields = innerFields(INNER_WITHOUT_OUTER_USE);

        assertThat(fields).noneMatch(Field::isSynthetic);
    }

    @Test
    @DisplayName("M01 §11 · Serializable inner class keeps the outer field even when unused")
    void innerClass_keepsSyntheticOuterField_whenItIsSerializable() throws ClassNotFoundException {
        Field[] fields = innerFields(SERIALIZABLE_INNER_WITHOUT_OUTER_USE);

        assertThat(Arrays.stream(fields))
                .anyMatch(f -> f.isSynthetic() && f.getType().getName().equals(OUTER_BINARY_NAME));
    }

    @Test
    @DisplayName("M01 §11 · static members in an inner class compile with the default release")
    void innerClass_compiles_whenItDeclaresAStaticFieldUnderTheDefaultRelease() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, INNER_WITH_STATIC_FIELD));

        assertThat(result.success()).isTrue();
    }

    @Test
    @DisplayName("M01 §11 · static members in an inner class are rejected with --release 15")
    void innerClass_doesNotCompile_whenItDeclaresAStaticFieldUnderRelease15() {
        assumeTrue(ToolProvider.getSystemJavaCompiler().getSourceVersions().contains(SourceVersion.RELEASE_15));

        var result =
                InMemoryCompiler.compile(Map.of(SOURCE_NAME, INNER_WITH_STATIC_FIELD), "--release", RELEASE_15_OPTION);

        assertThat(result.errorCodes()).containsExactly(STATIC_IN_INNER_CODE);
    }
}
