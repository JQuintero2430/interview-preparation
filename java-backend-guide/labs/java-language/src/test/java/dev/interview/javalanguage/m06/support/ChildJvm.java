package dev.interview.javalanguage.m06.support;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.TimeUnit;

// Runs a main class from this test classpath in a fresh JVM, for behavior that ends the JVM itself.
public final class ChildJvm {

    // The container sets these and the child JVM would echo "Picked up ..." into the output.
    private static final List<String> ECHOED_OPTION_VARIABLES =
            List.of("JAVA_TOOL_OPTIONS", "_JAVA_OPTIONS", "JDK_JAVA_OPTIONS");
    private static final long TIMEOUT_SECONDS = 60;

    private ChildJvm() {}

    public record Result(int exitCode, List<String> lines) {}

    public static Result run(Class<?> mainClass) throws IOException, InterruptedException {
        Path java = Path.of(System.getProperty("java.home"), "bin", "java");
        ProcessBuilder builder = new ProcessBuilder(
                        java.toString(), "-cp", System.getProperty("java.class.path"), mainClass.getName())
                .redirectErrorStream(true);
        builder.environment().keySet().removeAll(ECHOED_OPTION_VARIABLES);
        Process process = builder.start();
        if (!process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS)) {
            process.destroyForcibly();
            throw new IllegalStateException(mainClass.getName() + " did not finish in " + TIMEOUT_SECONDS + " s");
        }
        String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        return new Result(process.exitValue(), output.lines().toList());
    }
}
