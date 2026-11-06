package dev.interview.javalanguage.m01.s08;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 01 §8: the three phases of overload resolution and the most specific method rule.
class OverloadResolutionTest {

    static final class AllThree {
        static String m(long value) {
            return "long";
        }

        static String m(Integer value) {
            return "Integer";
        }

        static String m(int... values) {
            return "varargs";
        }
    }

    static final class BoxingOrVarargs {
        static String m(Integer value) {
            return "Integer";
        }

        static String m(int... values) {
            return "varargs";
        }
    }

    static final class VarargsOnly {
        static String m(int... values) {
            return "varargs";
        }
    }

    static final class StringOrObject {
        static String m(String value) {
            return "String";
        }

        static String m(Object value) {
            return "Object";
        }
    }

    @Test
    @DisplayName("M01 §8 · widening beats boxing, boxing beats varargs")
    void intArgument_prefersWidening_overBoxingAndVarargs() {
        assertThat(AllThree.m(1)).isEqualTo("long");
    }

    @Test
    @DisplayName("M01 §8 · without a widening candidate, boxing beats varargs")
    void intArgument_prefersBoxing_overVarargs() {
        assertThat(BoxingOrVarargs.m(1)).isEqualTo("Integer");
    }

    @Test
    @DisplayName("M01 §8 · varargs applies only in the last phase")
    void intArgument_usesVarargs_whenNoOtherPhaseApplies() {
        assertThat(VarargsOnly.m(1)).isEqualTo("varargs");
    }

    @Test
    @DisplayName("M01 §8 · null argument with String and Integer overloads is ambiguous")
    void nullArgument_doesNotCompile_whenNeitherOverloadIsMoreSpecific() {
        var result = InMemoryCompiler.compile(
                Map.of("T", "class T { void m(String s) {} void m(Integer i) {} void x() { m(null); } }"));

        assertThat(result.errorCodes()).containsExactly("compiler.err.ref.ambiguous");
    }

    @Test
    @DisplayName("M01 §8 · null argument picks the most specific overload")
    void nullArgument_picksString_overObject() {
        assertThat(StringOrObject.m(null)).isEqualTo("String");
    }
}
