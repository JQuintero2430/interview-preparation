package dev.interview.javalanguage.m06.s02;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class FinallyFlowTest {

    @Test
    @DisplayName("M06 §2 · finally runs after return and before the caller sees the value")
    void finally_runsAfterReturnExpression_beforeCaller() {
        List<String> events = new ArrayList<>();

        String result = FinallyFlow.returnThenFinally(events);
        events.add("caller got " + result);

        assertThat(events).containsExactly("try", "return expression", "finally", "caller got result");
    }

    @Test
    @DisplayName("M06 §2 · a returned int is not changed by finally, a returned list is")
    void finally_cannotChangeReturnedPrimitive_butCanMutateReturnedObject() {
        assertThat(FinallyFlow.finallyChangesReturnedPrimitive()).isEqualTo(1);
        assertThat(FinallyFlow.finallyMutatesReturnedList()).containsExactly("try", "finally");
    }

    @Test
    @DisplayName("M06 §2 · a return in finally discards the exception from try")
    void returnInFinally_discardsPendingException() {
        assertThat(FinallyFlow.returnInFinallyDiscardsException()).isEqualTo(42);
    }

    @Test
    @DisplayName("M06 §2 · a throw in finally replaces the exception from try and keeps no trace of it")
    void throwInFinally_replacesPendingException() {
        Throwable thrown = catchThrowable(FinallyFlow::throwInFinallyReplacesException);

        assertThat(thrown).isExactlyInstanceOf(IllegalStateException.class).hasMessage("from finally");
        assertThat(thrown.getSuppressed()).isEmpty();
        assertThat(thrown.getCause()).isNull();
    }

    @Test
    @DisplayName("M06 §2 · finally runs when break and continue leave the try block")
    void finally_runsOnBreakAndContinue() {
        assertThat(FinallyFlow.finallyOnBreakAndContinue())
                .containsExactly("body 0", "finally 0", "finally 1", "body 2", "finally 2", "finally 3");
    }

    @Test
    @DisplayName("M06 §2 · an exception no catch matches propagates after finally runs")
    void unmatchedException_propagatesAfterFinally() {
        List<String> events = new ArrayList<>();

        Throwable thrown = catchThrowable(() -> FinallyFlow.unmatchedExceptionPropagatesAfterFinally(events));

        assertThat(thrown).isExactlyInstanceOf(UnsupportedOperationException.class);
        assertThat(events).containsExactly("try", "finally");
    }

    @Test
    @DisplayName("M06 §2 · the first catch whose type matches handles the exception")
    void firstCompatibleCatch_handlesException() {
        assertThat(CatchSelection.handle(() -> {})).isEqualTo("completed");
        assertThat(CatchSelection.handle(() -> {
                    throw new FileNotFoundException("rates.csv");
                }))
                .isEqualTo("missing file");
        assertThat(CatchSelection.handle(() -> {
                    throw new IOException("disk");
                }))
                .isEqualTo("other I/O failure");
        assertThat(CatchSelection.handle(() -> {
                    throw new IllegalStateException();
                }))
                .isEqualTo("bug");
        assertThat(CatchSelection.handle(() -> {
                    throw new InterruptedException();
                }))
                .isEqualTo("other checked");
    }
}
