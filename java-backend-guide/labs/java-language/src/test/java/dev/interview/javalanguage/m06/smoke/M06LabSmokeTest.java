package dev.interview.javalanguage.m06.smoke;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class M06LabSmokeTest {

    @Test
    @DisplayName("M06 smoke · try-with-resources keeps the body's exception and suppresses the close failure")
    void tryWithResources_suppressesCloseFailure_behindBodyFailure() {
        Throwable thrown = catchThrowable(() -> {
            try (AutoCloseable resource = () -> {
                throw new IllegalStateException("close failed");
            }) {
                throw new IllegalArgumentException("body failed");
            }
        });

        assertThat(thrown).isInstanceOf(IllegalArgumentException.class).hasMessage("body failed");
        assertThat(thrown.getSuppressed())
                .singleElement()
                .isInstanceOf(IllegalStateException.class)
                .hasFieldOrPropertyWithValue("message", "close failed");
    }

    @Test
    @DisplayName("M06 smoke · a compile-time constant concatenation is the same pooled string as the literal")
    void constantConcatenation_isInterned_likeTheLiteral() {
        String literal = "ab";
        final String a = "a";
        String runtimeA = new String("a");

        assertThat(literal == a + "b").isTrue();
        assertThat(literal == runtimeA + "b").isFalse();
        assertThat(literal == (runtimeA + "b").intern()).isTrue();
    }

    @Test
    @DisplayName("M06 smoke · UTF-8 bytes decoded as ISO-8859-1 turn é into two characters")
    void utf8Bytes_decodedAsLatin1_produceMojibake() {
        byte[] utf8 = "é".getBytes(StandardCharsets.UTF_8);

        String wrong = new String(utf8, StandardCharsets.ISO_8859_1);

        assertThat(utf8).hasSize(2);
        assertThat(wrong).isEqualTo("Ã©");
    }
}
