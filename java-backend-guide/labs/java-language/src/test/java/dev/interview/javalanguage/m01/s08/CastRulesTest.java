package dev.interview.javalanguage.m01.s08;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 01 §8: when a reference cast to an interface compiles, and when it fails at run time.
class CastRulesTest {

    @Test
    @DisplayName("M01 §8 · cast to an interface: compile error for a final class")
    void castToInterface_doesNotCompile_whenTheClassIsFinalAndDoesNotImplementIt() {
        var result = InMemoryCompiler.compile(
                Map.of("T", "final class F {} class T { Runnable r(F f) { return (Runnable) f; } }"));

        assertThat(result.errorCodes()).containsExactly("compiler.err.prob.found.req");
    }

    @Test
    @DisplayName("M01 §8 · cast to an interface on a non-final class compiles and fails at run time")
    void castToInterface_throwsClassCastException_whenTheObjectDoesNotImplementIt() {
        Payment payment = new Payment(100);

        assertThat(payment instanceof Runnable).isFalse();
        assertThatThrownBy(() -> castToRunnable(payment)).isInstanceOf(ClassCastException.class);
    }

    private static Runnable castToRunnable(Payment payment) {
        return (Runnable) payment;
    }
}
