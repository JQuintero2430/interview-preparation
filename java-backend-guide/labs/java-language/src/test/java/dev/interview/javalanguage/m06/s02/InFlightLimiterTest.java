package dev.interview.javalanguage.m06.s02;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.io.IOException;
import java.util.concurrent.RejectedExecutionException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class InFlightLimiterTest {

    private static final Work<String, IOException> FAILING = () -> {
        throw new IOException("downstream reset");
    };

    @Test
    @DisplayName("M06 §2 · the limiter releases its slot when the work returns")
    void run_releasesSlot_onNormalReturn() {
        InFlightLimiter limiter = new InFlightLimiter(1);

        String result = limiter.run(() -> "priced");

        assertThat(result).isEqualTo("priced");
        assertThat(limiter.inFlight()).isZero();
    }

    @Test
    @DisplayName(
            "M06 §2 · the limiter releases its slot when the work throws, and the caller sees the exact checked type")
    void run_releasesSlot_andRethrowsCheckedException() {
        InFlightLimiter limiter = new InFlightLimiter(1);

        IOException thrown = null;
        try {
            limiter.run(FAILING);
        } catch (IOException e) {
            thrown = e;
        }

        assertThat(thrown).hasMessage("downstream reset");
        assertThat(limiter.inFlight()).isZero();
        assertThat(limiter.run(() -> "next call admitted")).isEqualTo("next call admitted");
    }

    @Test
    @DisplayName("M06 §2 · without finally, one failure leaks the slot and the next call is rejected")
    void leakyLimiter_keepsSlot_afterFailure() {
        LeakyLimiter limiter = new LeakyLimiter(1);

        Throwable first = catchThrowable(() -> limiter.run(FAILING));
        Throwable second = catchThrowable(() -> limiter.run(() -> "never runs"));

        assertThat(first).isInstanceOf(IOException.class);
        assertThat(limiter.inFlight()).isEqualTo(1);
        assertThat(second).isInstanceOf(RejectedExecutionException.class).hasMessage("limit 1 reached");
    }
}
