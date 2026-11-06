package dev.interview.javalanguage.m01.s01;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ClassFileVersionTest {

    private static final String CLASS_NAME = "Plain";
    private static final Map<String, String> PLAIN_SOURCE = Map.of(CLASS_NAME, "class Plain {}");
    private static final Map<String, String> IS_BLANK_SOURCE =
            Map.of("UsesIsBlank", "class UsesIsBlank { boolean blank() { return \"\".isBlank(); } }");
    private static final String RELEASE = "--release";
    private static final String RELEASE_8 = "8";
    private static final String RELEASE_21 = "21";
    private static final int JAVA_25_MAJOR = 69;
    private static final int JAVA_21_MAJOR = 65;
    private static final int JAVA_8_MAJOR = 52;
    private static final int FIRST_MAJOR = 45;
    private static final int UNSIGNED_SHORT_MAX = 0xFFFF;
    private static final byte[] ALL_ONES_VERSION_HEADER = {
        (byte) 0xCA, (byte) 0xFE, (byte) 0xBA, (byte) 0xBE, 0, 0, (byte) 0xFF, (byte) 0xFF
    };
    private static final byte[] WRONG_MAGIC_HEADER = {1, 2, 3, 4, 0, 0, 0, 69};
    private static final byte[] TRUNCATED_HEADER = {(byte) 0xCA, (byte) 0xFE, (byte) 0xBA, (byte) 0xBE, 0, 0, 0};

    @Test
    @DisplayName("M01 §1 · Java 25 class file major version is 69")
    void majorVersion_is69_whenCompiledWithoutOptions() {
        byte[] classFile = compiledPlain();

        assertThat(ClassFileVersion.majorVersion(classFile)).isEqualTo(JAVA_25_MAJOR);
    }

    @Test
    @DisplayName("M01 §1 · major version 69 maps to feature release 25")
    void javaFeatureRelease_is25_whenMajorVersionIs69() {
        assertThat(ClassFileVersion.javaFeatureRelease(JAVA_25_MAJOR)).isEqualTo(25);
    }

    @Test
    @DisplayName("M01 §1 · --release 21 emits major version 65")
    void majorVersion_is65_whenCompiledWithRelease21() {
        byte[] classFile = compiledPlain(RELEASE, RELEASE_21);

        assertThat(ClassFileVersion.majorVersion(classFile)).isEqualTo(JAVA_21_MAJOR);
    }

    @Test
    @DisplayName("M01 §1 · --release 8 emits major version 52")
    void majorVersion_is52_whenCompiledWithRelease8() {
        byte[] classFile = compiledPlain(RELEASE, RELEASE_8);

        assertThat(ClassFileVersion.majorVersion(classFile)).isEqualTo(JAVA_8_MAJOR);
    }

    @Test
    @DisplayName("M01 §1 · --release 8 rejects an API added in Java 11")
    void compile_reportsError_whenRelease8CodeCallsJava11Api() {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(IS_BLANK_SOURCE, RELEASE, RELEASE_8);

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).isNotEmpty();
    }

    @Test
    @DisplayName("M01 §1 · without --release the same Java 11 API call compiles")
    void compile_succeeds_whenDefaultReleaseCodeCallsJava11Api() {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(IS_BLANK_SOURCE);

        assertThat(result.success()).isTrue();
    }

    @Test
    @DisplayName("M01 §1 · majorVersion reads the unsigned 16-bit value at offset 6")
    void majorVersion_is65535_whenVersionBytesAreAllOnes() {
        assertThat(ClassFileVersion.majorVersion(ALL_ONES_VERSION_HEADER)).isEqualTo(UNSIGNED_SHORT_MAX);
    }

    @Test
    @DisplayName("M01 §1 · majorVersion rejects bytes without the class-file magic number")
    void majorVersion_throws_whenMagicNumberIsMissing() {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> ClassFileVersion.majorVersion(WRONG_MAGIC_HEADER))
                .withMessage(ClassFileVersion.NOT_A_CLASS_FILE);
    }

    @Test
    @DisplayName("M01 §1 · majorVersion rejects input shorter than the 8-byte header")
    void majorVersion_throws_whenInputIsShorterThanHeader() {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> ClassFileVersion.majorVersion(TRUNCATED_HEADER))
                .withMessage(ClassFileVersion.NOT_A_CLASS_FILE);
    }

    @Test
    @DisplayName("M01 §1 · major version 45 maps to feature release 1")
    void javaFeatureRelease_is1_whenMajorVersionIs45() {
        assertThat(ClassFileVersion.javaFeatureRelease(FIRST_MAJOR)).isEqualTo(1);
    }

    @Test
    @DisplayName("M01 §1 · major versions below 45 are rejected")
    void javaFeatureRelease_throws_whenMajorVersionIsBelow45() {
        assertThatIllegalArgumentException().isThrownBy(() -> ClassFileVersion.javaFeatureRelease(FIRST_MAJOR - 1));
    }

    private static byte[] compiledPlain(String... options) {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(PLAIN_SOURCE, options);
        assertThat(result.success()).isTrue();
        return result.classes().get(CLASS_NAME);
    }
}
