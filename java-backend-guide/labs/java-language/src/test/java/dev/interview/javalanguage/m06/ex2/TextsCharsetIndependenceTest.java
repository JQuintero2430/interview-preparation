package dev.interview.javalanguage.m06.ex2;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assumptions.assumeThat;

import dev.interview.javalanguage.m06.support.ChildJvm;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class TextsCharsetIndependenceTest {

    // Surefire runs with the module folder as working directory.
    private static final Path MAIN = Path.of("src/main/java/dev/interview/javalanguage/m06/ex2");

    private static final Pattern LINE_COMMENT = Pattern.compile("//.*");
    // Calls that convert between bytes and text with the default charset when given none (JEP 400's list).
    private static final List<Pattern> DEFAULT_CHARSET_CALLS = List.of(
            Pattern.compile("getBytes\\(\\s*\\)"),
            Pattern.compile("new String\\(\\s*\\w+\\s*\\)"),
            Pattern.compile("Charset\\.defaultCharset"),
            Pattern.compile("\\b(InputStreamReader|OutputStreamWriter|FileReader|FileWriter|PrintStream|Scanner)\\b"));

    @Test
    @DisplayName("Ex06.2 · (6) no call in the solution falls back to the default charset")
    void solution_namesEveryCharset() throws IOException {
        List<String> sources;
        try (Stream<Path> files = Files.list(MAIN)) {
            sources = files.map(TextsCharsetIndependenceTest::codeWithoutLineComments)
                    .toList();
        }

        assertThat(sources).hasSize(2);
        for (Pattern call : DEFAULT_CHARSET_CALLS) {
            assertThat(sources).noneMatch(code -> call.matcher(code).find());
        }
        assertThat(sources).anyMatch(code -> code.contains("StandardCharsets.UTF_8"));
    }

    @Test
    @DisplayName("Ex06.2 · (6) every result is the same in a JVM whose default charset is US-ASCII")
    void results_doNotDependOnTheDefaultCharset() throws Exception {
        ChildJvm.Result child =
                ChildJvm.run(TextsProbe.class, Map.of("LC_ALL", "C", "LANG", "C"), List.of("-Dfile.encoding=COMPAT"));

        assertThat(child.exitCode()).isZero();
        assumeThat(child.lines().getFirst()).isEqualTo("default=US-ASCII");
        assertThat(child.lines().subList(1, child.lines().size())).isEqualTo(TextsProbe.results());
        assertThat(TextsProbe.results()).contains("decodeStrictLatin1=malformed@3", "normalizedEquals=true");
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
