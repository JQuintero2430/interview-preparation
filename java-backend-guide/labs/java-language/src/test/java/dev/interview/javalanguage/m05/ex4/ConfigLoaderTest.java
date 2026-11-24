package dev.interview.javalanguage.m05.ex4;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.MalformedInputException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class ConfigLoaderTest {

    @TempDir
    Path dir;

    @BeforeEach
    void writeFiles() throws IOException {
        Files.writeString(dir.resolve("10-service.properties"), "pool.size=8\nregion=eu-west-1\ntimeout.ms=500\n");
        Files.writeString(dir.resolve("20-shared.properties"), "region=us-east-1\nretries=three\n");
        // 0xC3 starts a two-byte UTF-8 sequence; 0x28 cannot continue it, so decoding fails.
        Files.write(dir.resolve("30-binary.properties"), new byte[] {'k', '=', (byte) 0xC3, 0x28, '\n'});
        Files.writeString(dir.resolve("40-escape.properties"), "path=C:\\u12\n");
        Files.writeString(dir.resolve("notes.txt"), "not a properties file\n");
    }

    @Test
    @DisplayName("Ex05.4 · (1) load returns one outcome per *.properties file, in name order, and throws for none")
    void load_returnsOneOutcomePerFile() throws IOException {
        List<LoadResult> results = ConfigLoader.fromDisk().load(dir);

        assertThat(results)
                .extracting(r -> r.file().getFileName().toString())
                .containsExactly(
                        "10-service.properties",
                        "20-shared.properties",
                        "30-binary.properties",
                        "40-escape.properties");
        assertThat(results.get(0))
                .isInstanceOfSatisfying(
                        LoadResult.Loaded.class,
                        loaded -> assertThat(loaded.properties().getProperty("pool.size"))
                                .isEqualTo("8"));
        assertThat(results.get(1)).isInstanceOf(LoadResult.Loaded.class);
    }

    @Test
    @DisplayName(
            "Ex05.4 · (1) a failure keeps its path and the original cause: bad bytes, a bad escape, a vanished file")
    void load_failuresKeepPathAndCause() throws IOException {
        Path vanished = dir.resolve("50-vanished.properties");
        // The listing names a file that is gone by the time it is read (deleted between list and read).
        var loader = new ConfigLoader(d -> Stream.concat(Files.list(d), Stream.of(vanished)));

        List<LoadResult> results = loader.load(dir);

        assertThat(results.get(2)).isInstanceOfSatisfying(LoadResult.Failed.class, failed -> {
            assertThat(failed.file()).isEqualTo(dir.resolve("30-binary.properties"));
            assertThat(failed.cause()).isInstanceOf(MalformedInputException.class);
        });
        assertThat(results.get(3))
                .isInstanceOfSatisfying(
                        LoadResult.Failed.class,
                        failed -> assertThat(failed.cause())
                                .isInstanceOf(IllegalArgumentException.class)
                                .hasMessage("Malformed \\uxxxx encoding."));
        assertThat(results.get(4)).isInstanceOfSatisfying(LoadResult.Failed.class, failed -> {
            assertThat(failed.file()).isEqualTo(vanished);
            assertThat(failed.cause()).isInstanceOf(NoSuchFileException.class);
        });
    }

    @Test
    @DisplayName("Ex05.4 · (2) the directory stream is closed after a load that had failing files")
    void load_closesDirectoryStream() throws IOException {
        AtomicInteger closed = new AtomicInteger();
        var loader = new ConfigLoader(d -> Files.list(d).onClose(closed::incrementAndGet));

        var results = loader.load(dir);

        assertThat(results).hasSize(4);
        assertThat(closed).hasValue(1);
    }

    @Test
    @DisplayName("Ex05.4 · (2) the directory stream is closed when reading the directory itself fails midway")
    void load_closesDirectoryStreamWhenListingFails() {
        AtomicInteger closed = new AtomicInteger();
        var failure = new UncheckedIOException(new IOException("directory became unreadable"));
        var loader = new ConfigLoader(d -> Stream.concat(
                        Files.list(d),
                        Stream.<Path>generate(() -> {
                                    throw failure;
                                })
                                .limit(1))
                .onClose(closed::incrementAndGet));

        assertThatExceptionOfType(UncheckedIOException.class)
                .isThrownBy(() -> loader.load(dir))
                .isSameAs(failure);
        assertThat(closed).hasValue(1);
    }

    @Test
    @DisplayName("Ex05.4 · (3) find searches the loaded files in name order: the first file that has the key wins")
    void find_firstFileInNameOrderWins() throws IOException {
        Config config = Config.of(ConfigLoader.fromDisk().load(dir));

        assertThat(config.find("region")).contains("eu-west-1");
        assertThat(config.find("retries")).contains("three");
        assertThat(config.find("absent")).isEmpty();
    }

    @Test
    @DisplayName("Ex05.4 · (3) the code under test never calls Optional.get()")
    void sourcesNeverCallGet() throws IOException {
        // Surefire runs with the module folder as working directory.
        Path main = Path.of("src/main/java/dev/interview/javalanguage/m05/ex4");
        try (Stream<Path> files = Files.list(main)) {
            List<String> sources = files.map(ConfigLoaderTest::read).toList();
            assertThat(sources).hasSize(4).noneMatch(source -> source.contains(".get()"));
        }
    }

    @Test
    @DisplayName("Ex05.4 · (4) requiredInt throws a ConfigException naming a missing key")
    void requiredInt_missingKey() throws IOException {
        Config config = Config.of(ConfigLoader.fromDisk().load(dir));

        assertThat(config.requiredInt("pool.size")).isEqualTo(8);
        assertThatExceptionOfType(ConfigException.class)
                .isThrownBy(() -> config.requiredInt("max.connections"))
                .withMessage("missing required key 'max.connections'")
                .satisfies(e -> assertThat(e.key()).isEqualTo("max.connections"))
                .withNoCause();
    }

    @Test
    @DisplayName(
            "Ex05.4 · (4) requiredInt throws a ConfigException naming the key, with the NumberFormatException as cause")
    void requiredInt_notANumber() throws IOException {
        Config config = Config.of(ConfigLoader.fromDisk().load(dir));

        assertThatExceptionOfType(ConfigException.class)
                .isThrownBy(() -> config.requiredInt("retries"))
                .withMessage("key 'retries' is not an integer")
                .withCauseInstanceOf(NumberFormatException.class)
                .satisfies(e -> assertThat(e.key()).isEqualTo("retries"));
    }

    @Test
    @DisplayName("Ex05.4 · (5) the default supplier runs only when the key is absent")
    void valueOr_defaultIsLazy() throws IOException {
        Config config = Config.of(ConfigLoader.fromDisk().load(dir));
        AtomicInteger calls = new AtomicInteger();

        String present = config.valueOr("timeout.ms", () -> "default-" + calls.incrementAndGet());
        assertThat(present).isEqualTo("500");
        assertThat(calls).hasValue(0);

        String absent = config.valueOr("cache.ttl", () -> "default-" + calls.incrementAndGet());
        assertThat(absent).isEqualTo("default-1");
        assertThat(calls).hasValue(1);
    }

    private static String read(Path file) {
        try {
            return Files.readString(file);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
