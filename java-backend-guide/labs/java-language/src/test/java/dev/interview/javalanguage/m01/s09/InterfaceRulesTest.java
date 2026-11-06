package dev.interview.javalanguage.m01.s09;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.lang.reflect.Modifier;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 01 §9: the resolution and modifier rules are compiler and JVM behavior, so the guide's claims are
// checked against javac and the runtime instead of being restated from memory.
class InterfaceRulesTest {

    private static final String TYPES_INCOMPATIBLE = "compiler.err.types.incompatible";
    private static final String ILLEGAL_MODIFIERS = "compiler.err.illegal.combination.of.modifiers";
    private static final String ABSTRACT_INSTANTIATED = "compiler.err.abstract.cant.be.instantiated";
    private static final String ASSIGN_TO_CONSTANT = "compiler.err.cant.assign.val.to.var";

    private static final String SOURCE_NAME = "T";
    private static final String CONSTANT_FIELD = "MAX";
    private static final String TWO_UNRELATED_DEFAULTS =
            "interface A { default void m() {} } interface B { default void m() {} } class T implements A, B {}";
    private static final String ABSTRACT_FINAL = "abstract final class T {}";
    private static final String INSTANTIATES_ABSTRACT = "abstract class P {} class T { P p = new P(); }";
    private static final String REASSIGNS_CONSTANT = "interface I { int X = 1; } class T { void f() { I.X = 2; } }";

    private static final String FROM_CLASS = "class";
    private static final String FROM_FIRST = "first";
    private static final String FROM_SECOND = "second";
    private static final String FROM_BASE = "base";
    private static final String FROM_SUB = "sub";

    interface Greeter {
        default String hello() {
            return FROM_FIRST;
        }
    }

    static class Parent {
        public String hello() {
            return FROM_CLASS;
        }
    }

    static class ClassAndInterface extends Parent implements Greeter {}

    interface First {
        default String pick() {
            return FROM_FIRST;
        }
    }

    interface Second {
        default String pick() {
            return FROM_SECOND;
        }
    }

    static class ChoosesSecond implements First, Second {
        @Override
        public String pick() {
            return Second.super.pick();
        }
    }

    interface Base {
        default String name() {
            return FROM_BASE;
        }
    }

    interface Sub extends Base {
        @Override
        default String name() {
            return FROM_SUB;
        }
    }

    static class BaseAndSub implements Base, Sub {}

    interface Limits {
        int MAX = 10;
    }

    @Test
    @DisplayName("M01 §9 · class method wins over default method")
    void classMethod_wins_whenInheritedFromASuperclassAndAnInterfaceDefault() {
        assertThat(new ClassAndInterface().hello()).isEqualTo(FROM_CLASS);
    }

    @Test
    @DisplayName("M01 §9 · X.super.m() selects an interface default")
    void qualifiedSuperCall_selectsTheNamedInterfaceDefault_whenTwoInterfacesDeclareIt() {
        assertThat(new ChoosesSecond().pick()).isEqualTo(FROM_SECOND);
    }

    @Test
    @DisplayName("M01 §9 · more specific interface default wins")
    void defaultMethod_ofTheMoreSpecificInterface_wins_whenBothInterfacesAreImplemented() {
        assertThat(new BaseAndSub().name()).isEqualTo(FROM_SUB);
    }

    @Test
    @DisplayName("M01 §9 · two unrelated defaults without override do not compile")
    void twoUnrelatedDefaults_doNotCompile_whenTheClassDoesNotOverride() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, TWO_UNRELATED_DEFAULTS));

        assertThat(result.errorCodes()).containsExactly(TYPES_INCOMPATIBLE);
    }

    @Test
    @DisplayName("M01 §9 · abstract final class does not compile")
    void abstractFinalClass_doesNotCompile_whenDeclaredWithBothModifiers() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, ABSTRACT_FINAL));

        assertThat(result.errorCodes()).containsExactly(ILLEGAL_MODIFIERS);
    }

    @Test
    @DisplayName("M01 §9 · abstract class cannot be instantiated")
    void abstractClass_doesNotCompile_whenInstantiatedWithNew() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, INSTANTIATES_ABSTRACT));

        assertThat(result.errorCodes()).containsExactly(ABSTRACT_INSTANTIATED);
    }

    @Test
    @DisplayName("M01 §9 · interface field is implicitly public static final")
    void interfaceField_isPublicStaticFinal_whenDeclaredWithoutModifiers() throws NoSuchFieldException {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, REASSIGNS_CONSTANT));

        int modifiers = Limits.class.getField(CONSTANT_FIELD).getModifiers();

        assertThat(result.errorCodes()).containsExactly(ASSIGN_TO_CONSTANT);
        assertThat(modifiers).isEqualTo(Modifier.PUBLIC | Modifier.STATIC | Modifier.FINAL);
    }
}
