package dev.interview.javalanguage.m06.s05;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UncaughtHandlerTest {

    private Thread.UncaughtExceptionHandler previousDefault;

    @BeforeEach
    void rememberDefaultHandler() {
        previousDefault = Thread.getDefaultUncaughtExceptionHandler();
    }

    @AfterEach
    void restoreDefaultHandler() {
        Thread.setDefaultUncaughtExceptionHandler(previousDefault);
    }

    @Test
    @DisplayName("M06 §5 · an uncaught exception reaches the thread's handler")
    void uncaughtException_reachesThreadsHandler() throws Exception {
        CompletableFuture<String> seen = new CompletableFuture<>();
        IllegalStateException boom = new IllegalStateException("boom");

        Thread thread = Thread.ofPlatform()
                .name("importer")
                .uncaughtExceptionHandler((t, e) -> seen.complete(t.getName() + " " + (e == boom)))
                .start(() -> {
                    throw boom;
                });
        thread.join();

        assertThat(seen.get(10, TimeUnit.SECONDS)).isEqualTo("importer true");
    }

    @Test
    @DisplayName("M06 §5 · the default handler runs when the thread has none")
    void defaultHandler_runsWhenThreadHasNone() throws Exception {
        CompletableFuture<Throwable> seen = new CompletableFuture<>();
        Thread.setDefaultUncaughtExceptionHandler((t, e) -> seen.complete(e));

        Thread thread = Thread.ofPlatform().start(() -> {
            throw new IllegalArgumentException("bad row");
        });
        thread.join();

        assertThat(seen.get(10, TimeUnit.SECONDS))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("bad row");
    }

    @Test
    @DisplayName("M06 §5 · the thread's own handler wins over the default handler")
    void threadHandler_winsOverDefault() throws Exception {
        CompletableFuture<String> seen = new CompletableFuture<>();
        Thread.setDefaultUncaughtExceptionHandler((t, e) -> seen.complete("default"));

        Thread thread = Thread.ofPlatform()
                .uncaughtExceptionHandler((t, e) -> seen.complete("own"))
                .start(() -> {
                    throw new IllegalStateException("boom");
                });
        thread.join();

        assertThat(seen.get(10, TimeUnit.SECONDS)).isEqualTo("own");
    }

    @Test
    @DisplayName("M06 §5 · without an explicit handler the thread's group acts as its handler")
    void withoutExplicitHandler_threadGroupIsTheHandler() {
        Thread unstarted = Thread.ofPlatform().unstarted(() -> {});

        assertThat(unstarted.getUncaughtExceptionHandler()).isSameAs(unstarted.getThreadGroup());
    }
}
