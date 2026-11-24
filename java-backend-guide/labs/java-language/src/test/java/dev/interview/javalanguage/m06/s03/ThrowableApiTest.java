package dev.interview.javalanguage.m06.s03;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ThrowableApiTest {

    @Test
    @DisplayName("M06 §3 · printStackTrace shows Caused by and Suppressed sections")
    void printStackTrace_showsSuppressedThenCause() {
        IOException root = new IOException("Connection reset");
        ExportFailedException failure = new ExportFailedException("Failed to export batch b-7", root);
        failure.addSuppressed(new IllegalStateException("close failed"));

        String trace = traceOf(failure);

        assertThat(trace)
                .startsWith(ExportFailedException.class.getName() + ": Failed to export batch b-7")
                .contains("\tSuppressed: java.lang.IllegalStateException: close failed")
                .contains("Caused by: java.io.IOException: Connection reset")
                .containsPattern("\\t\\.\\.\\. \\d+ more");
        assertThat(trace.indexOf("Suppressed: ")).isLessThan(trace.indexOf("Caused by: "));
    }

    @Test
    @DisplayName("M06 §3 · initCause twice throws IllegalStateException")
    void initCause_canBeCalledOnlyOnce() {
        IllegalStateException legacy = new IllegalStateException("legacy wrapper");
        legacy.initCause(new IOException("first"));

        Throwable second = catchThrowable(() -> legacy.initCause(new IOException("second")));

        assertThat(second).isInstanceOf(IllegalStateException.class).hasMessageStartingWith("Can't overwrite cause");
        assertThat(legacy.getCause()).hasMessage("first");
    }

    @Test
    @DisplayName("M06 §3 · initCause after a cause constructor throws IllegalStateException")
    void initCause_failsAfterCauseConstructor() {
        RuntimeException wrapped = new RuntimeException("wrapped", new IOException("io"));

        assertThat(catchThrowable(() -> wrapped.initCause(new IOException("other"))))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("M06 §3 · a throwable cannot be its own cause or suppress itself")
    void selfCause_andSelfSuppression_areRejected() {
        RuntimeException failure = new RuntimeException("self");

        assertThat(catchThrowable(() -> failure.initCause(failure)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Self-causation not permitted");
        assertThat(catchThrowable(() -> failure.addSuppressed(failure))).isInstanceOf(IllegalArgumentException.class);
        assertThat(catchThrowable(() -> failure.addSuppressed(null))).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("M06 §3 · the Throwable(cause) constructor uses cause.toString() as its message")
    void causeOnlyConstructor_usesCauseToStringAsMessage() {
        RuntimeException wrapped = new RuntimeException(new IOException("disk full"));

        assertThat(wrapped.getMessage()).isEqualTo("java.io.IOException: disk full");
        assertThat(wrapped.getLocalizedMessage()).isEqualTo(wrapped.getMessage());
        assertThat(wrapped).hasToString("java.lang.RuntimeException: java.io.IOException: disk full");
        assertThat(new RuntimeException()).hasToString("java.lang.RuntimeException");
    }

    @Test
    @DisplayName("M06 §3 · wrapping with only getMessage() loses the cause and its stack trace")
    void wrappingWithMessageOnly_losesTheCause() {
        IOException root = new IOException("Connection reset");

        RuntimeException lossy = new RuntimeException(root.getMessage());
        RuntimeException chained = new RuntimeException("Failed to export batch b-7", root);

        assertThat(lossy.getCause()).isNull();
        assertThat(traceOf(lossy)).doesNotContain("Caused by:").doesNotContain("IOException");
        assertThat(chained.getCause()).isSameAs(root);
        assertThat(traceOf(chained)).contains("Caused by: java.io.IOException: Connection reset");
    }

    @Test
    @DisplayName("M06 §3 · getSuppressed returns a copy, and is empty when suppression is disabled")
    void getSuppressed_isACopy_andDisabledSuppressionIgnoresAdds() {
        RuntimeException normal = new RuntimeException("normal");
        normal.addSuppressed(new IllegalStateException("one"));
        normal.getSuppressed()[0] = null;
        NoSuppression quiet = new NoSuppression();
        quiet.addSuppressed(new IllegalStateException("ignored"));

        assertThat(normal.getSuppressed()).singleElement().hasFieldOrPropertyWithValue("message", "one");
        assertThat(quiet.getSuppressed()).isEmpty();
    }

    @Test
    @DisplayName("M06 §3 · a cause cycle is printed as CIRCULAR REFERENCE instead of looping forever")
    void causeCycle_isPrintedAsCircularReference() {
        IllegalStateException first = new IllegalStateException("first");
        IllegalStateException second = new IllegalStateException("second");
        first.initCause(second);
        second.initCause(first);

        assertThat(traceOf(first)).contains("[CIRCULAR REFERENCE: java.lang.IllegalStateException: first]");
    }

    private static String traceOf(Throwable t) {
        StringWriter out = new StringWriter();
        t.printStackTrace(new PrintWriter(out));
        return out.toString();
    }

    private static final class NoSuppression extends RuntimeException {
        NoSuppression() {
            super("suppression disabled", null, false, true);
        }
    }
}
