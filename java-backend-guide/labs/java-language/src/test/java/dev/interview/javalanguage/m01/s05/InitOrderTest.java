package dev.interview.javalanguage.m01.s05;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.OutputCapture;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins the order module 01 §5 states: class initialization once, then per new: super chain, initializers, body.
class InitOrderTest {

    @Test
    @DisplayName("M01 §5 · initialization order across a two-level hierarchy")
    void firstNewRunsStaticInitThenInstanceSteps_secondNewOnlyInstanceSteps() {
        // One method on purpose: static initializers run once per JVM, so a second test could not see them.
        var first = OutputCapture.linesOf(InitOrder.Child::new);
        var second = OutputCapture.linesOf(InitOrder.Child::new);

        assertThat(first)
                .containsExactly(
                        "Parent static",
                        "Child static",
                        "Parent instance initializer",
                        "Parent field initializer",
                        "Parent constructor",
                        "Child instance initializer",
                        "Child field initializer",
                        "Child constructor");
        assertThat(second)
                .containsExactly(
                        "Parent instance initializer",
                        "Parent field initializer",
                        "Parent constructor",
                        "Child instance initializer",
                        "Child field initializer",
                        "Child constructor");
    }
}
