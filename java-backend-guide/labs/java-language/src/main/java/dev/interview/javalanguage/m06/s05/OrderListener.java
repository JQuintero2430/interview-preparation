package dev.interview.javalanguage.m06.s05;

import java.util.Objects;

// The boundary: the only place that catches, decides what happens to the message, and logs once.
public final class OrderListener {

    private final OrderProcessor processor;
    private final FailureLog failureLog;

    public OrderListener(OrderProcessor processor, FailureLog failureLog) {
        this.processor = Objects.requireNonNull(processor);
        this.failureLog = Objects.requireNonNull(failureLog);
    }

    public Outcome handle(String message) {
        try {
            processor.process(message);
            return Outcome.ACK;
        } catch (TransientFailureException e) {
            failureLog.failed(message, e);
            return Outcome.RETRY;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return Outcome.RETRY;
        } catch (RuntimeException e) {
            failureLog.failed(message, e);
            return Outcome.DEAD_LETTER;
        }
    }
}
