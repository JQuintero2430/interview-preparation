package dev.interview.javalanguage.m05.s09;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.MalformedInputException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class StreamClosingTest {

    @TempDir
    Path dir;

    @Test
    @DisplayName("M05 §9 · onClose runs when a try-with-resources closes the stream")
    void onClose_runsOnClose_notOnTerminalOperation() {
        List<String> events = new ArrayList<>();

        try (Stream<String> s = Stream.of("a", "b").onClose(() -> events.add("closed"))) {
            events.add("count=" + s.count());
            events.add("after terminal operation");
        }

        assertThat(events).containsExactly("count=2", "after terminal operation", "closed");
    }

    @Test
    @DisplayName("M05 §9 · flatMap closes each mapped stream; a terminal operation inside map does not")
    void flatMap_closesInnerStreams_whileMapWithInnerTerminalDoesNot() {
        List<Integer> closedByFlatMap = new ArrayList<>();
        List<Integer> closedByMap = new ArrayList<>();

        long viaFlatMap = Stream.of(1, 2, 3)
                .flatMap(i -> Stream.of(i, i).onClose(() -> closedByFlatMap.add(i)))
                .count();
        long viaMap = Stream.of(1, 2, 3)
                .mapToLong(
                        i -> Stream.of(i, i).onClose(() -> closedByMap.add(i)).count())
                .sum();

        assertThat(viaFlatMap).isEqualTo(viaMap).isEqualTo(6L);
        assertThat(closedByFlatMap).containsExactly(1, 2, 3);
        assertThat(closedByMap).isEmpty();
    }

    @Test
    @DisplayName("M05 §9 · every close handler runs and later failures are suppressed into the first")
    void close_runsAllHandlers_andRelaysFirstExceptionWithSuppressed() {
        List<String> ran = new ArrayList<>();
        IllegalStateException first = new IllegalStateException("first");
        IllegalStateException second = new IllegalStateException("second");
        Stream<String> s = Stream.of("a")
                .onClose(() -> {
                    ran.add("1");
                    throw first;
                })
                .onClose(() -> {
                    ran.add("2");
                    throw second;
                })
                .onClose(() -> ran.add("3"));

        assertThatThrownBy(s::close).isSameAs(first);
        assertThat(ran).containsExactly("1", "2", "3");
        assertThat(first.getSuppressed()).containsExactly(second);
    }

    @Test
    @DisplayName("M05 §9 · Files.lines reports a read error as UncheckedIOException from the terminal operation")
    void filesLines_malformedInput_throwsUncheckedIOExceptionFromTerminalOperation() throws IOException {
        // 0xC3 starts a two-byte UTF-8 sequence; 0x28 cannot continue it.
        Path file = Files.write(dir.resolve("bad.log"), new byte[] {'o', 'k', '\n', (byte) 0xC3, 0x28, '\n'});

        try (Stream<String> lines = Files.lines(file)) {
            assertThatThrownBy(lines::toList)
                    .isInstanceOf(UncheckedIOException.class)
                    .cause()
                    .isInstanceOf(MalformedInputException.class);
        }
    }

    @Test
    @DisplayName("M05 §9 · countMatching reads every regular file of the directory")
    void countMatching_countsAcrossFiles() throws IOException {
        Files.writeString(dir.resolve("a.log"), "ERROR one\nINFO two\nERROR three\n");
        Files.writeString(dir.resolve("b.log"), "INFO four\nERROR five\n");
        Files.createDirectory(dir.resolve("archive"));

        assertThat(LineScanner.countMatching(dir, "ERROR")).isEqualTo(3L);
    }
}
