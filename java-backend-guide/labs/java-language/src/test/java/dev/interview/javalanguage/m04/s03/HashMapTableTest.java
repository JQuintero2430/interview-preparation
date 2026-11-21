package dev.interview.javalanguage.m04.s03;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// The table of a HashMap is a private field of java.util, so the probe runs in a child JVM that opens
// java.util to the unnamed module. The surefire JVM stays unopened (M04 §1 lab design).
class HashMapTableTest {

    private static final String ADD_OPENS = "--add-opens";
    private static final String OPEN_JAVA_UTIL = "java.base/java.util=ALL-UNNAMED";
    private static final long TIMEOUT_SECONDS = 30;
    // The JVM echoes these variables as "Picked up ..." lines, which are not the probe's output.
    private static final List<String> ECHOED_OPTION_VARIABLES =
            List.of("JAVA_TOOL_OPTIONS", "_JAVA_OPTIONS", "JDK_JAVA_OPTIONS");

    private static List<String> report;

    @BeforeAll
    static void runProbe() throws Exception {
        report = launchProbe();
    }

    @Test
    @DisplayName("M04 §3 · the table is allocated on the first put and doubles when size exceeds 0.75 × capacity")
    void defaultMap_allocatesLazily_andDoublesAfterThreshold() {
        assertThat(report).contains("default: new=0 put1=16 put12=16 put13=32");
    }

    @Test
    @DisplayName("M04 §3 · new HashMap<>(100) gets 128 buckets and resizes on the 97th put")
    void capacityConstructor_roundsUpToPowerOfTwo_andStillResizes() {
        assertThat(report).contains("new HashMap<>(100): new=0 put1=128 put96=128 put97=256");
    }

    @Test
    @DisplayName("M04 §3 · HashMap.newHashMap(100) sizes the table so 100 puts never resize")
    void newHashMap_sizesForExpectedMappings() {
        assertThat(report).contains("HashMap.newHashMap(100): new=0 put1=256 put100=256");
    }

    @Test
    @DisplayName("M04 §3 · the table doubles at the threshold and a colliding bin treeifies only at capacity 64")
    void collidingBin_resizesBelow64_andTreeifiesAt64() {
        assertThat(report).contains("colliding keys: put8=16 list, put9=32 list, put10=64 list, put11=64 tree");
    }

    private static List<String> launchProbe() throws IOException, InterruptedException, URISyntaxException {
        Path java = Path.of(System.getProperty("java.home"), "bin", "java");
        Path classes = Path.of(TableProbe.class
                .getProtectionDomain()
                .getCodeSource()
                .getLocation()
                .toURI());
        ProcessBuilder builder = new ProcessBuilder(
                        java.toString(),
                        ADD_OPENS,
                        OPEN_JAVA_UTIL,
                        "-cp",
                        classes.toString(),
                        TableProbe.class.getName())
                .redirectErrorStream(true);
        builder.environment().keySet().removeAll(ECHOED_OPTION_VARIABLES);
        Process process = builder.start();
        if (!process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS)) {
            process.destroyForcibly();
            fail("probe did not finish within " + TIMEOUT_SECONDS + " s");
        }
        String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        assertThat(process.exitValue()).as(output).isZero();
        return output.lines().toList();
    }
}
