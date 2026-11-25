package dev.interview.javalanguage.m06.s07;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assumptions.assumeThat;

import dev.interview.javalanguage.m06.support.ChildJvm;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.charset.UnsupportedCharsetException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// The default charset is fixed at JVM startup, so each case starts a child JVM in the POSIX "C" locale,
// the locale of many minimal container images.
class DefaultCharsetTest {

    private static final Map<String, String> C_LOCALE = Map.of("LC_ALL", "C", "LANG", "C");

    @Test
    @DisplayName("M06 §7 · the default charset is UTF-8 unless file.encoding overrides it")
    void defaultCharset_isUtf8_whateverTheLocale() throws Exception {
        Map<String, String> report = report(List.of());

        assertThat(report).containsEntry("default", "UTF-8").containsEntry("file.encoding", "UTF-8");
    }

    @Test
    @DisplayName("M06 §7 · file.encoding=COMPAT makes the default charset the native encoding")
    void compat_restoresNativeEncoding() throws Exception {
        Map<String, String> report = report(List.of("-Dfile.encoding=COMPAT"));

        String nativeEncoding = report.get("native.encoding");
        assertThat(report.get("file.encoding")).isEqualTo(nativeEncoding);
        assertThat(Charset.forName(report.get("default"))).isEqualTo(Charset.forName(nativeEncoding));
    }

    @Test
    @DisplayName("M06 §7 · System.out piped to another process encodes with the native encoding")
    void pipedStdout_usesNativeEncoding() throws Exception {
        Map<String, String> report = report(List.of());

        Charset stdout = Charset.forName(report.get("stdout.encoding"));
        assertThat(stdout).isEqualTo(Charset.forName(report.get("native.encoding")));
        // The parent decodes the child's bytes as UTF-8, so this is exactly what System.out wrote.
        String expected = new String("café".getBytes(stdout), StandardCharsets.UTF_8);
        assertThat(report).containsEntry("text", expected);
    }

    @Test
    @DisplayName("M06 §7 · on Linux the C locale's native encoding is ASCII, so System.out writes é as ?")
    void cLocaleOnLinux_isAscii() throws Exception {
        assumeThat(System.getProperty("os.name")).isEqualTo("Linux");

        Map<String, String> report = report(List.of());

        assertThat(Charset.forName(report.get("native.encoding"))).isEqualTo(StandardCharsets.US_ASCII);
        assertThat(report).containsEntry("text", "caf?").containsEntry("default", "UTF-8");
    }

    @Test
    @DisplayName("M06 §7 · Charset.forName(\"default\") is rejected since Java 18")
    void defaultAlias_isRejected() {
        assertThatThrownBy(() -> Charset.forName("default")).isInstanceOf(UnsupportedCharsetException.class);
    }

    private static Map<String, String> report(List<String> jvmOptions) throws Exception {
        ChildJvm.Result result = ChildJvm.run(CharsetReport.class, C_LOCALE, jvmOptions);
        assertThat(result.exitCode()).isZero();
        return result.lines().stream()
                .map(line -> line.split("=", 2))
                .collect(Collectors.toMap(kv -> kv[0], kv -> kv[1]));
    }
}
