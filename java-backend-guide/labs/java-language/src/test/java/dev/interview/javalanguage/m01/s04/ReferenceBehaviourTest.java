package dev.interview.javalanguage.m01.s04;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNullPointerException;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins the JDK 25 behaviour module 01 §4 states: field defaults, definite assignment, method naming, helpful NPEs.
class ReferenceBehaviourTest {

    private static final String UNASSIGNED_LOCAL = "compiler.err.var.might.not.have.been.initialized";
    private static final String HELPFUL_NPE =
            "Cannot invoke \"dev.interview.javalanguage.m01.s04.Basket.add(String)\" because \"this.basket\" is null";

    // Never assigned on purpose: the NPE test reads it through this, so the message does not depend on javac -g.
    private Basket basket;

    @Test
    @DisplayName("M01 §4 · fields get default values")
    void fields_startAtTheirTypesDefaultValue() {
        Defaults defaults = new Defaults();

        assertThat(defaults.count).isZero();
        assertThat(defaults.active).isFalse();
        assertThat(defaults.ratio).isZero();
        assertThat(defaults.initial).isEqualTo('\u0000');
        assertThat(defaults.owner).isNull();
    }

    @Test
    @DisplayName("M01 §4 · reading an unassigned local does not compile")
    void readingAnUnassignedLocal_isACompileError() {
        var result = InMemoryCompiler.compile(Map.of("Unassigned", """
                class Unassigned {
                    int read() {
                        int x;
                        return x;
                    }
                }
                """));

        assertThat(result.errorCodes()).containsExactly(UNASSIGNED_LOCAL);
    }

    @Test
    @DisplayName("M01 §4 · a method may share its class's name")
    void methodNamedLikeItsClass_compilesWithoutAnyDiagnostic() {
        var result = InMemoryCompiler.compile(Map.of("Basket", """
                class Basket {
                    void Basket() {}
                }
                """), "-Xlint:all");

        assertThat(result.success()).isTrue();
        assertThat(result.diagnostics()).isEmpty();
    }

    @Test
    @DisplayName("M01 §4 · helpful NullPointerException names the null expression")
    void nullPointerMessage_namesTheMethodAndTheNullField() {
        assertThatNullPointerException().isThrownBy(() -> basket.add("x")).withMessage(HELPFUL_NPE);
    }

    private static final class Defaults {
        int count;
        boolean active;
        double ratio;
        char initial;
        Object owner;
    }
}
