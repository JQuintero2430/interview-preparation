package dev.interview.javalanguage.m06.s05;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.util.concurrent.CountDownLatch;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class InterruptHandlingTest {

    @AfterEach
    void clearInterruptFlag() {
        Thread.interrupted();
    }

    @Test
    @DisplayName("M06 §5 · catching InterruptedException and restoring the flag keeps isInterrupted true")
    void restoringTheFlag_keepsInterruptVisible() {
        Thread.currentThread().interrupt();

        boolean done = Interrupts.awaitRestoringInterrupt(new CountDownLatch(1), Duration.ofSeconds(10));

        assertThat(done).isFalse();
        assertThat(Thread.currentThread().isInterrupted()).isTrue();
    }

    @Test
    @DisplayName("M06 §5 · catching InterruptedException without restoring the flag loses the interrupt")
    void swallowing_losesTheInterrupt() {
        Thread.currentThread().interrupt();

        try {
            new CountDownLatch(1).await();
        } catch (InterruptedException e) {
            // swallowed on purpose: the anti-pattern under test
        }

        assertThat(Thread.currentThread().isInterrupted()).isFalse();
    }
}
