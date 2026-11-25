package dev.interview.javalanguage.m06.s05;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class OrderListenerTest {

    private final List<Throwable> logged = new ArrayList<>();
    private final FailureLog failureLog = (message, failure) -> logged.add(failure);

    @AfterEach
    void clearInterruptFlag() {
        Thread.interrupted();
    }

    @Test
    @DisplayName("M06 §5 · a processed message is acknowledged and nothing is logged")
    void success_isAcknowledged() {
        OrderListener listener = new OrderListener(message -> {}, failureLog);

        assertThat(listener.handle("order-1")).isEqualTo(Outcome.ACK);
        assertThat(logged).isEmpty();
    }

    @Test
    @DisplayName("M06 §5 · a transient failure is logged once, with its cause chain, and the message is retried")
    void transientFailure_loggedOnceAndRetried() {
        IOException root = new IOException("connection reset");
        TransientFailureException failure = new TransientFailureException("inventory call failed", root);
        OrderListener listener = new OrderListener(
                message -> {
                    throw failure;
                },
                failureLog);

        assertThat(listener.handle("order-2")).isEqualTo(Outcome.RETRY);
        assertThat(logged).containsExactly(failure);
        assertThat(logged.getFirst()).hasCause(root);
    }

    @Test
    @DisplayName("M06 §5 · any other runtime failure is logged once and the message goes to the dead-letter queue")
    void otherFailure_loggedOnceAndDeadLettered() {
        IllegalArgumentException bug = new IllegalArgumentException("quantity must be positive");
        OrderListener listener = new OrderListener(
                message -> {
                    throw bug;
                },
                failureLog);

        assertThat(listener.handle("order-3")).isEqualTo(Outcome.DEAD_LETTER);
        assertThat(logged).containsExactly(bug);
    }

    @Test
    @DisplayName("M06 §5 · an interrupted listener restores the interrupt flag and asks for a retry")
    void interrupted_restoresFlagAndRetries() {
        OrderListener listener = new OrderListener(
                message -> {
                    throw new InterruptedException("shutting down");
                },
                failureLog);

        assertThat(listener.handle("order-4")).isEqualTo(Outcome.RETRY);
        assertThat(Thread.currentThread().isInterrupted()).isTrue();
        assertThat(logged).isEmpty();
    }
}
