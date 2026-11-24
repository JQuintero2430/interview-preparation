package dev.interview.javalanguage.m06.s04;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class StackTraceCostTest {

    @Test
    @DisplayName("M06 §4 · the stack trace is recorded where the exception is constructed, not where it is thrown")
    void stackTrace_isCapturedAtConstruction() {
        IllegalStateException prepared = StackTraces.createHere();

        Throwable thrown = catchThrowable(() -> StackTraces.throwElsewhere(prepared));

        assertThat(thrown).isSameAs(prepared);
        assertThat(thrown.getStackTrace()[0].getMethodName()).isEqualTo("createHere");
        assertThat(thrown.getStackTrace())
                .noneMatch(frame -> frame.getMethodName().equals("throwElsewhere"));
    }

    @Test
    @DisplayName("M06 §4 · an exception built with writableStackTrace false has an empty stack trace")
    void writableStackTraceFalse_givesEmptyTrace() {
        RateLimitedException limited = new RateLimitedException("client-9");

        limited.fillInStackTrace();
        limited.setStackTrace(new StackTraceElement[] {new StackTraceElement("C", "m", "C.java", 1)});
        limited.addSuppressed(new IllegalStateException("ignored"));

        assertThat(limited.getStackTrace()).isEmpty();
        assertThat(limited.getSuppressed()).isEmpty();
        assertThat(limited).hasMessage("rate limit exceeded for client client-9");
    }

    @Test
    @DisplayName("M06 §4 · overriding fillInStackTrace to return this leaves the stack trace empty")
    void overriddenFillInStackTrace_givesEmptyTrace() {
        StackTraces.NoTrace noTrace = new StackTraces.NoTrace("no trace");

        assertThat(noTrace.getStackTrace()).isEmpty();
    }
}
