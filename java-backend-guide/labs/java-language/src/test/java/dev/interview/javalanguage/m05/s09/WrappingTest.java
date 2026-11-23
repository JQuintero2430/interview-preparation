package dev.interview.javalanguage.m05.s09;

import static dev.interview.javalanguage.m05.s09.CheckedFunction.unchecked;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class WrappingTest {

    @TempDir
    Path dir;

    @Test
    @DisplayName("M05 §9 · a wrapped IOException surfaces with its cause")
    void unchecked_wrapsIOException_keepingTheCause() throws IOException {
        Path present = Files.writeString(dir.resolve("a.log"), "ok");
        Path missing = dir.resolve("missing.log");

        assertThatThrownBy(() -> List.of(present, missing).stream()
                        .map(unchecked(Files::readString))
                        .toList())
                .isInstanceOf(UncheckedIOException.class)
                .cause()
                .isInstanceOf(NoSuchFileException.class)
                .hasMessage(missing.toString());
    }

    @Test
    @DisplayName("M05 §9 · the first wrapped failure ends the whole pipeline")
    void unchecked_firstFailure_stopsLaterElements() throws IOException {
        Path first = Files.writeString(dir.resolve("1.log"), "one");
        Path third = Files.writeString(dir.resolve("3.log"), "three");
        List<Path> visited = new ArrayList<>();

        assertThatThrownBy(() -> List.of(first, dir.resolve("2.log"), third).stream()
                        .peek(visited::add)
                        .map(unchecked(Files::readString))
                        .toList())
                .isInstanceOf(UncheckedIOException.class);
        assertThat(visited).containsExactly(first, dir.resolve("2.log"));
    }

    @Test
    @DisplayName("M05 §9 · unchecked exceptions pass through the adapter unwrapped")
    void unchecked_runtimeException_isRethrownAsIs() {
        IllegalArgumentException thrown = new IllegalArgumentException("bad id");
        Function<String, String> f = unchecked(s -> {
            throw thrown;
        });

        assertThatThrownBy(() -> f.apply("x")).isSameAs(thrown);
    }

    @Test
    @DisplayName("M05 §9 · a wrapped InterruptedException restores the interrupt flag")
    void unchecked_interruptedException_restoresInterruptFlag() {
        Function<String, String> f = unchecked(s -> {
            throw new InterruptedException("stop");
        });

        try {
            assertThatThrownBy(() -> f.apply("x"))
                    .isInstanceOf(IllegalStateException.class)
                    .cause()
                    .isInstanceOf(InterruptedException.class);
            assertThat(Thread.currentThread().isInterrupted()).isTrue();
        } finally {
            Thread.interrupted();
        }
    }

    @Test
    @DisplayName("M05 §9 · sneaky throw delivers a checked IOException that no signature declares")
    void sneakyThrow_throwsTheCheckedExceptionItself() {
        IOException disk = new IOException("disk");
        Function<String, String> f = s -> {
            throw SneakyThrow.sneakyThrow(disk);
        };

        assertThatThrownBy(() -> f.apply("x")).isSameAs(disk);
    }
}
