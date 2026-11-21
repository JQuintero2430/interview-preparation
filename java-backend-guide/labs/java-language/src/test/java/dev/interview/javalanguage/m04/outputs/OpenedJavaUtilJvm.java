package dev.interview.javalanguage.m04.outputs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.TimeUnit;

// Runs a main class in a child JVM that opens java.util to the unnamed module, so a probe can read
// HashMap's private fields. The surefire JVM stays unopened (M04 §1 lab design, route R3).
final class OpenedJavaUtilJvm {

    private static final String ADD_OPENS = "--add-opens";
    private static final String OPEN_JAVA_UTIL = "java.base/java.util=ALL-UNNAMED";
    private static final long TIMEOUT_SECONDS = 30;
    // The JVM echoes these variables as "Picked up ..." lines, which are not the probe's output.
    private static final List<String> ECHOED_OPTION_VARIABLES =
            List.of("JAVA_TOOL_OPTIONS", "_JAVA_OPTIONS", "JDK_JAVA_OPTIONS");

    private OpenedJavaUtilJvm() {}

    static List<String> run(Class<?> mainClass) throws IOException, InterruptedException, URISyntaxException {
        Path java = Path.of(System.getProperty("java.home"), "bin", "java");
        Path classes = Path.of(
                mainClass.getProtectionDomain().getCodeSource().getLocation().toURI());
        ProcessBuilder builder = new ProcessBuilder(
                        java.toString(), ADD_OPENS, OPEN_JAVA_UTIL, "-cp", classes.toString(), mainClass.getName())
                .redirectErrorStream(true);
        builder.environment().keySet().removeAll(ECHOED_OPTION_VARIABLES);
        Process process = builder.start();
        if (!process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS)) {
            process.destroyForcibly();
            fail(mainClass.getSimpleName() + " did not finish within " + TIMEOUT_SECONDS + " s");
        }
        String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        assertThat(process.exitValue()).as(output).isZero();
        return output.lines().toList();
    }
}
