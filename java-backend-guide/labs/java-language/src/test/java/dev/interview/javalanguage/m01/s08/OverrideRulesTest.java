package dev.interview.javalanguage.m01.s08;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 01 §8: static methods are hidden, and the compile-time rules every override must follow.
class OverrideRulesTest {

    static class Parent {
        static String kind() {
            return "parent";
        }
    }

    static class Child extends Parent {
        static String kind() {
            return "child";
        }
    }

    @Test
    @DisplayName("M01 §8 · static method call uses the reference type")
    void staticMethod_isHidden_soTheReferenceTypeDecides() {
        Parent p = new Child();

        assertThat(p.kind()).isEqualTo("parent");
    }

    @Test
    @DisplayName("M01 §8 · narrower access in override does not compile")
    void override_cannotNarrowAccess() {
        assertThat(errorsOf("class P { public void m() {} } class T extends P { void m() {} }"))
                .isEqualTo("compiler.err.override.weaker.access");
    }

    @Test
    @DisplayName("M01 §8 · an override may narrow the return type")
    void override_compiles_whenTheReturnTypeIsCovariant() {
        assertThat(errorsOf(
                        "class P { Object m() { return null; } } class T extends P { String m() { return \"\"; } }"))
                .isEmpty();
    }

    @Test
    @DisplayName("M01 §8 · an override cannot widen the return type")
    void override_doesNotCompile_whenTheReturnTypeIsWider() {
        assertThat(errorsOf(
                        "class P { String m() { return null; } } class T extends P { Object m() { return \"\"; } }"))
                .isEqualTo("compiler.err.override.incompatible.ret");
    }

    @Test
    @DisplayName("M01 §8 · an override cannot throw a broader checked exception")
    void override_cannotAddCheckedExceptions() {
        assertThat(errorsOf("class P { void m() {} } class T extends P { void m() throws Exception {} }"))
                .isEqualTo("compiler.err.override.meth.doesnt.throw");
    }

    @Test
    @DisplayName("M01 §8 · @Override on an overload does not compile")
    void overrideAnnotation_rejectsAnOverloadOfEquals() {
        assertThat(errorsOf("class T { @Override public boolean equals(T other) { return true; } }"))
                .isEqualTo("compiler.err.method.does.not.override.superclass");
    }

    @Test
    @DisplayName("M01 §8 · a final method is not overridden")
    void override_doesNotCompile_whenTheParentMethodIsFinal() {
        assertThat(errorsOf("class P { final void m() {} } class T extends P { void m() {} }"))
                .isEqualTo("compiler.err.override.meth");
    }

    @Test
    @DisplayName("M01 §8 · a static method cannot hide an instance method")
    void staticMethod_doesNotCompile_whenItHidesAnInstanceMethod() {
        assertThat(errorsOf("class P { void m() {} } class T extends P { static void m() {} }"))
                .isEqualTo("compiler.err.override.static");
    }

    @Test
    @DisplayName("M01 §8 · an instance method cannot override a static method")
    void instanceMethod_doesNotCompile_whenItOverridesAStaticMethod() {
        assertThat(errorsOf("class P { static void m() {} } class T extends P { void m() {} }"))
                .isEqualTo("compiler.err.override.meth");
    }

    private static String errorsOf(String source) {
        return String.join(",", InMemoryCompiler.compile(Map.of("T", source)).errorCodes());
    }
}
