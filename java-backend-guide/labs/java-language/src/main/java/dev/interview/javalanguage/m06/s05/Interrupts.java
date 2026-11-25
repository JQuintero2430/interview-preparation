package dev.interview.javalanguage.m06.s05;

import java.time.Duration;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

public final class Interrupts {

    private Interrupts() {}

    // For code that cannot declare InterruptedException: report "not done" and keep the interrupt visible.
    public static boolean awaitRestoringInterrupt(CountDownLatch latch, Duration timeout) {
        try {
            return latch.await(timeout.toMillis(), TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
}
