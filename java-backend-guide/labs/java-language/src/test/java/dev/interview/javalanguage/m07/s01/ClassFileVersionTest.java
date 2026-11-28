package dev.interview.javalanguage.m07.s01;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class ClassFileVersionTest {

    private static final String PLAIN = "class Plain {}";

    private static final String PREVIEW = """
            class Preview {
                static boolean fitsByte(int value) {
                    return value instanceof byte b;
                }
            }
            """;

    private static byte[] compile(String name, String source, String... options) {
        var result = InMemoryCompiler.compile(Map.of(name, source), options);
        assertThat(result.success())
                .as("compiles with %s", String.join(" ", options))
                .isTrue();
        return result.classes().get(name);
    }

    @ParameterizedTest(name = "--release {0} → major {1}")
    @CsvSource({"8, 52", "11, 55", "17, 61", "21, 65", "25, 69"})
    @DisplayName("M07 §1 · --release N stamps major version N + 44")
    void release_stampsMajorVersion(int release, int major) {
        var version = ClassFileVersion.of(compile("Plain", PLAIN, "--release", String.valueOf(release)));

        assertThat(version.major()).isEqualTo(major);
        assertThat(version.minor()).isZero();
        assertThat(version.javaRelease()).isEqualTo(release);
        assertThat(version.dependsOnPreview()).isFalse();
    }

    @Test
    @DisplayName("M07 §1 · ClassFileVersion reads 69.65535 from a preview class")
    void previewClass_readsAsPreview() {
        var version = ClassFileVersion.of(compile("Preview", PREVIEW, "--release", "25", "--enable-preview"));

        assertThat(version).hasToString("69.65535");
        assertThat(version.dependsOnPreview()).isTrue();
        assertThat(version.javaRelease()).isEqualTo(25);
    }

    @Test
    @DisplayName("M07 §1 · loadableOn applies the JVMS 4.1 rule for preview and ordinary classes")
    void loadableOn_appliesTheJvmsRule() {
        var java25Preview = new ClassFileVersion(69, 65535);
        var java24Preview = new ClassFileVersion(68, 65535);
        var java25 = new ClassFileVersion(69, 0);
        var java17 = new ClassFileVersion(61, 0);

        assertThat(java25Preview.loadableOn(25, false)).isFalse();
        assertThat(java25Preview.loadableOn(25, true)).isTrue();
        assertThat(java25Preview.loadableOn(26, true)).isFalse();
        assertThat(java24Preview.loadableOn(25, true)).isFalse();
        assertThat(java25.loadableOn(25, false)).isTrue();
        assertThat(java25.loadableOn(21, false)).isFalse();
        assertThat(java17.loadableOn(25, true)).isTrue();
    }

    @Test
    @DisplayName("M07 §1 · ClassFileVersion rejects bytes that are not a class file")
    void notAClassFile_isRejected() {
        assertThatThrownBy(() -> ClassFileVersion.of(new byte[] {1, 2, 3}))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("not a class file: 3 bytes");
        assertThatThrownBy(() -> ClassFileVersion.of("PK\u0003\u0004 not a class".getBytes()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("not a class file: wrong magic number");
    }
}
