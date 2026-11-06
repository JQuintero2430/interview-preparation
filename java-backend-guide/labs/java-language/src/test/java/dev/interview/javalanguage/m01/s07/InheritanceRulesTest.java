package dev.interview.javalanguage.m01.s07;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins the inheritance rules module 01 §7 states: field hiding, the subclass relation and single class inheritance.
class InheritanceRulesTest {

    static class Parent {
        String name = "parent";

        String describe() {
            return name;
        }
    }

    static class Child extends Parent {
        String name = "child";

        String superName() {
            return super.name;
        }
    }

    @Test
    @DisplayName("M01 §7 · a field is hidden, not overridden")
    void field_isChosenByTheStaticType_notByTheRuntimeClass() {
        Parent p = new Child();

        assertThat(p.name).isEqualTo("parent");
        assertThat(((Child) p).name).isEqualTo("child");
        assertThat(((Child) p).superName()).isEqualTo("parent");
        assertThat(p.describe()).isEqualTo("parent");
    }

    @Test
    @DisplayName("M01 §7 · a class is not its own subclass, but isAssignableFrom is reflexive")
    void subclassRelation_isNotReflexive_whileIsAssignableFromIs() {
        assertThat(String.class.isAssignableFrom(String.class)).isTrue();
        assertThat(String.class.getSuperclass()).isEqualTo(Object.class);
        assertThat(Object.class.getSuperclass()).isNull();
        assertThat(Runnable.class.getSuperclass()).isNull();

        var result = InMemoryCompiler.compile(Map.of("A", "class A extends A {}"));

        assertThat(result.errorCodes()).containsExactly("compiler.err.cyclic.inheritance");
    }

    @Test
    @DisplayName("M01 §7 · a class extends at most one class")
    void classDeclaration_withTwoSuperclasses_doesNotParse() {
        var result = InMemoryCompiler.compile(Map.of("D", "class B {} class C {} class D extends B, C {}"));

        assertThat(result.errorCodes()).containsExactly("compiler.err.expected");
    }
}
