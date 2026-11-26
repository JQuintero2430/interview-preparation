package dev.interview.javalanguage.m06.ex1;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ExporterSourceTest {

    // Surefire runs with the module folder as working directory.
    private static final Path MAIN = Path.of("src/main/java/dev/interview/javalanguage/m06/ex1");

    private static final Pattern LINE_COMMENT = Pattern.compile("//.*");
    private static final Pattern CATCH_ALL = Pattern.compile("catch\\s*\\(\\s*(final\\s+)?(Exception|Throwable)\\b");
    private static final Pattern FINALLY = Pattern.compile("\\bfinally\\b");

    @Test
    @DisplayName("Ex06.1 · (6) the solution has no catch (Exception e), no catch (Throwable t) and no finally block")
    void solution_hasNoCatchAllAndNoFinally() throws IOException {
        List<String> sources;
        try (Stream<Path> files = Files.list(MAIN)) {
            sources = files.map(ExporterSourceTest::codeWithoutLineComments).toList();
        }

        assertThat(sources).hasSize(7);
        assertThat(sources).noneMatch(code -> CATCH_ALL.matcher(code).find());
        assertThat(sources).noneMatch(code -> FINALLY.matcher(code).find());
        assertThat(sources).anyMatch(code -> code.contains("catch (IOException e)"));
    }

    private static String codeWithoutLineComments(Path file) {
        try {
            return LINE_COMMENT
                    .matcher(Files.readString(file, StandardCharsets.UTF_8))
                    .replaceAll("");
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
