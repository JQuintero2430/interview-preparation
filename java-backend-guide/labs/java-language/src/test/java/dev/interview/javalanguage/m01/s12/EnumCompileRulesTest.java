package dev.interview.javalanguage.m01.s12;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.lang.reflect.Modifier;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 01 §12 compiler rules against the javac running the tests.
class EnumCompileRulesTest {

    private static final String INSTANTIATION_CODE = "compiler.err.enum.cant.be.instantiated";
    private static final String MODIFIER_NOT_ALLOWED_CODE = "compiler.err.mod.not.allowed.here";

    private static final String SOURCE_NAME = "T";
    private static final String PLAIN_BINARY_NAME = "Plain";
    private static final String BODIED_BINARY_NAME = "Bodied";

    private static final String NEW_ON_ENUM = "enum T { A; static Object f() { return new T(); } }";
    private static final String ENUM_EXTENDS_CLASS = "class Base {} enum T extends Base { A }";
    private static final String ENUM_IMPLEMENTS_INTERFACE =
            "interface Named { String name(); } enum T implements Named { A }";
    private static final String PUBLIC_CONSTRUCTOR = "enum T { A; public T() {} }";
    private static final String PLAIN_AND_BODIED = "enum Plain { A, B } enum Bodied { A { void f() {} }, B }";
    private static final String UNQUALIFIED_SWITCH =
            "enum E { A, B } class T { int f(E e) {" + " switch (e) { case A: return 1; default: return 0; } } }";

    @Test
    @DisplayName("M01 §12 · new on an enum does not compile")
    void newOnEnum_doesNotCompile_whenCalledInsideTheEnum() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, NEW_ON_ENUM));

        assertThat(result.errorCodes()).containsExactly(INSTANTIATION_CODE);
    }

    @Test
    @DisplayName("M01 §12 · an enum cannot extend a class")
    void enumExtendingAClass_doesNotCompile_whenDeclared() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, ENUM_EXTENDS_CLASS));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).isNotEmpty();
    }

    @Test
    @DisplayName("M01 §12 · an enum may implement an interface")
    void enumImplementingAnInterface_compiles_whenDeclared() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, ENUM_IMPLEMENTS_INTERFACE));

        assertThat(result.success()).isTrue();
    }

    @Test
    @DisplayName("M01 §12 · a public enum constructor does not compile")
    void publicConstructor_doesNotCompile_whenDeclaredOnAnEnum() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, PUBLIC_CONSTRUCTOR));

        assertThat(result.errorCodes()).containsExactly(MODIFIER_NOT_ALLOWED_CODE);
    }

    @Test
    @DisplayName("M01 §12 · an enum without constant bodies is final; with one it is not final")
    void enumModifiers_dependOnConstantBodies_whenCompared() throws ClassNotFoundException {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, PLAIN_AND_BODIED));
        assertThat(result.success()).isTrue();

        Class<?> plain = result.load(PLAIN_BINARY_NAME);
        Class<?> bodied = result.load(BODIED_BINARY_NAME);

        assertThat(Modifier.isFinal(plain.getModifiers())).isTrue();
        assertThat(plain.isSealed()).isFalse();
        assertThat(Modifier.isFinal(bodied.getModifiers())).isFalse();
        assertThat(bodied.isSealed()).isTrue();
    }

    @Test
    @DisplayName("M01 §12 · a switch statement on an enum uses unqualified constant names")
    void switchStatement_compiles_whenCaseLabelsAreUnqualifiedConstantNames() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, UNQUALIFIED_SWITCH));

        assertThat(result.success()).isTrue();
    }
}
