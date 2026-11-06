package dev.interview.javalanguage.m01.smoke;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayOutputStream;
import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class M01LabSmokeTest {

    private static final int EXPECTED_FEATURE = 25;
    private static final String VERSION_FLAG = "--version";
    private static final String EXPECTED_BANNER_PREFIX = "javac 25";

    @Test
    @DisplayName("M01 smoke · tests run on Java 25")
    void runtimeVersion_isFeature25_whenTestsRun() {
        assertThat(Runtime.version().feature()).isEqualTo(EXPECTED_FEATURE);
    }

    @Test
    @DisplayName("M01 smoke · the system compiler is available for compile-time questions")
    void systemCompiler_printsJavac25Banner_whenVersionFlagGiven() {
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        assertThat(compiler).isNotNull();
        int exitCode = compiler.run(null, out, out, VERSION_FLAG);

        assertThat(exitCode).isZero();
        assertThat(out.toString()).startsWith(EXPECTED_BANNER_PREFIX);
    }
}
