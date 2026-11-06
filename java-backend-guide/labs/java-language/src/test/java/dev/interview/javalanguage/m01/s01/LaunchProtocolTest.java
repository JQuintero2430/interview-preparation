package dev.interview.javalanguage.m01.s01;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.io.IOException;
import java.lang.reflect.Modifier;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class LaunchProtocolTest {

    private static final String HELLO_RESOURCE = "/m01/s01/Hello.java";
    private static final String TWO_MAINS_RESOURCE = "/m01/s01/TwoMains.java";
    private static final String HELLO_CLASS = "Hello";
    private static final String HELLO_OUTPUT = "Hello from a compact source file";
    private static final String STRING_ARRAY_MAIN_OUTPUT = "String[] main";
    private static final String JAVA_HOME_PROPERTY = "java.home";
    private static final String BIN = "bin";
    private static final String JAVA = "java";
    private static final long LAUNCH_TIMEOUT_SECONDS = 30;

    @Test
    @DisplayName("M01 §1 · compact source file runs its instance main")
    void sourceFileMode_printsGreeting_whenFileIsCompact() throws Exception {
        Launch launch = launch(resource(HELLO_RESOURCE));

        assertThat(launch.exitCode()).isZero();
        assertThat(launch.lines()).containsExactly(HELLO_OUTPUT);
    }

    @Test
    @DisplayName("M01 §1 · launcher prefers main(String[]) over main()")
    void sourceFileMode_invokesStringArrayMain_whenClassDeclaresBothForms() throws Exception {
        Launch launch = launch(resource(TWO_MAINS_RESOURCE));

        assertThat(launch.exitCode()).isZero();
        assertThat(launch.lines()).containsExactly(STRING_ARRAY_MAIN_OUTPUT);
    }

    @Test
    @DisplayName("M01 §1 · compact source file declares a final class in the unnamed package")
    void compile_producesFinalClassInUnnamedPackage_whenSourceIsCompact() throws Exception {
        String source = Files.readString(resource(HELLO_RESOURCE));

        InMemoryCompiler.Result result = InMemoryCompiler.compile(Map.of(HELLO_CLASS, source));

        assertThat(result.success()).isTrue();
        Class<?> hello = result.load(HELLO_CLASS);
        assertThat(Modifier.isFinal(hello.getModifiers())).isTrue();
        assertThat(hello.getPackageName()).isEmpty();
    }

    private static Path resource(String name) throws URISyntaxException {
        return Path.of(LaunchProtocolTest.class.getResource(name).toURI());
    }

    private static Launch launch(Path sourceFile) throws IOException, InterruptedException {
        Path java = Path.of(System.getProperty(JAVA_HOME_PROPERTY), BIN, JAVA);
        Process process = new ProcessBuilder(java.toString(), sourceFile.toString())
                .redirectErrorStream(true)
                .start();
        if (!process.waitFor(LAUNCH_TIMEOUT_SECONDS, TimeUnit.SECONDS)) {
            process.destroyForcibly();
            fail("launcher did not finish within " + LAUNCH_TIMEOUT_SECONDS + " s");
        }
        String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        return new Launch(process.exitValue(), output.lines().toList());
    }

    private record Launch(int exitCode, List<String> lines) {}
}
