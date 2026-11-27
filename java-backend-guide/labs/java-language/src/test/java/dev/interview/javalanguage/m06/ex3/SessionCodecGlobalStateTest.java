package dev.interview.javalanguage.m06.ex3;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m06.support.ChildJvm;
import java.io.IOException;
import java.io.ObjectInputFilter;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.BinaryOperator;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SessionCodecGlobalStateTest {

    // Surefire runs with the module folder as working directory.
    private static final Path MAIN = Path.of("src/main/java/dev/interview/javalanguage/m06/ex3");

    @Test
    @DisplayName("Ex06.3 · (5) decoding leaves the JVM-wide filter and filter factory as they were")
    void globalStateUnchanged() throws Exception {
        ObjectInputFilter filterBefore = ObjectInputFilter.Config.getSerialFilter();
        BinaryOperator<ObjectInputFilter> factoryBefore = ObjectInputFilter.Config.getSerialFilterFactory();
        SessionCodec codec = new SessionCodec();

        codec.decode(codec.encode(new Session("user-42", List.of("admin"), Instant.EPOCH)));
        try {
            codec.decode(Payloads.write(new Probe()));
        } catch (RejectedSessionException expected) {
            // rejected by the stream filter, as criterion (2) asserts
        }

        assertThat(ObjectInputFilter.Config.getSerialFilter()).isSameAs(filterBefore);
        assertThat(ObjectInputFilter.Config.getSerialFilterFactory()).isSameAs(factoryBefore);
    }

    @Test
    @DisplayName("Ex06.3 · (5) the codec's source never sets a JVM-wide filter, factory or property")
    void noGlobalCallsInSource() throws IOException {
        List<String> sources;
        try (Stream<Path> files = Files.list(MAIN)) {
            sources = files.map(SessionCodecGlobalStateTest::read).toList();
        }

        assertThat(sources).hasSize(7);
        assertThat(sources)
                .noneMatch(code -> code.contains("setSerialFilter")
                        || code.contains("jdk.serialFilter")
                        || code.contains("System.setProperty"));
        assertThat(sources).anyMatch(code -> code.contains("in.setObjectInputFilter(filter)"));
    }

    @Test
    @DisplayName("Ex06.3 · (5) under a JVM-wide jdk.serialFilter, the stream filter replaces it unless merged")
    void streamFilterReplacesTheGlobalOne() throws Exception {
        ChildJvm.Result child = ChildJvm.run(
                GlobalFilterProbe.class, Map.of(), List.of("-Djdk.serialFilter=!dev.interview.javalanguage.m06.ex3.*"));

        assertThat(child.exitCode()).isZero();
        assertThat(child.lines())
                .containsExactly(
                        "global=!dev.interview.javalanguage.m06.ex3.*",
                        "plain=REJECTED",
                        "codec=Session",
                        "merged=REJECTED");
    }

    private static String read(Path file) {
        try {
            return Files.readString(file, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
