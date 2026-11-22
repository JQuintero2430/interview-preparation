package dev.interview.javalanguage.m05.s02;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Identity results are what JDK 25 does, not a guarantee: JLS §15.27.4 allows a new or an existing object.
class LambdaRuntimeTest {

    @Test
    @DisplayName("M05 §2 · JDK 25 returns one instance for a non-capturing lambda site (implementation behavior)")
    void nonCapturingSite_returnsSameInstance_onJdk25() {
        assertThat(LambdaSites.nonCapturing()).isSameAs(LambdaSites.nonCapturing());
    }

    @Test
    @DisplayName("M05 §2 · a capturing lambda site returns a new object per evaluation, of one class")
    void capturingSite_returnsNewInstances_ofOneClass() {
        var first = LambdaSites.capturing(1);
        var second = LambdaSites.capturing(1);

        assertThat(first).isNotSameAs(second);
        assertThat(first.getClass()).isSameAs(second.getClass());
    }

    @Test
    @DisplayName("M05 §2 · the lambda's class is a hidden class spun at run time, the anonymous class is not")
    void lambdaClass_isHidden_anonymousClass_isNot() {
        Class<?> lambdaClass = LambdaSites.nonCapturing().getClass();
        Class<?> anonymousClass = LambdaSites.anonymous().getClass();

        assertThat(lambdaClass.isHidden()).isTrue();
        assertThat(lambdaClass.getName()).contains("$$Lambda");
        assertThat(anonymousClass.isHidden()).isFalse();
        assertThat(anonymousClass.isAnonymousClass()).isTrue();
        assertThat(anonymousClass.getName()).endsWith("$1");
    }

    @Test
    @DisplayName("M05 §2 · a stack trace shows the lambda$ body method and omits the hidden class frame")
    void stackTrace_showsLambdaBody_omitsHiddenFrame() {
        StackTraceElement[] trace = LambdaSites.traceInsideLambda();

        assertThat(trace[0].getMethodName()).startsWith("lambda$");
        assertThat(trace[0].getClassName()).isEqualTo(LambdaSites.class.getName());
        assertThat(trace[1].getMethodName()).isEqualTo("traceInsideLambda");
        assertThat(Arrays.stream(trace)).noneMatch(frame -> frame.getClassName().contains("$$Lambda"));
    }
}
