package dev.interview.javalanguage.m06.ex2;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.catchThrowableOfType;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringWriter;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.MalformedInputException;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.Arrays;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class TextsTest {

    private static final String EMOJI = "😀"; // U+1F600, one code point, two chars
    private static final String E_ACUTE = "é"; // é as one code point
    private static final String E_DECOMPOSED = "é"; // e + COMBINING ACUTE ACCENT

    @Test
    @DisplayName("Ex06.2 · (1) truncate keeps a surrogate pair whole, where substring cuts it in half")
    void truncate_neverSplitsASurrogatePair() {
        String name = "ana" + EMOJI + "x";

        assertThat(Texts.truncate(name, 4)).isEqualTo("ana" + EMOJI);
        assertThat(Texts.truncate(name, 3)).isEqualTo("ana");
        assertThat(Texts.truncate(name, 0)).isEmpty();
        String naive = name.substring(0, 4);
        assertThat(Character.isHighSurrogate(naive.charAt(3))).isTrue();
    }

    @Test
    @DisplayName("Ex06.2 · (1) truncate returns the same instance when the text is short enough")
    void truncate_returnsSameInstance_whenShortEnough() {
        String name = "ana" + EMOJI;

        assertThat(name).hasSize(5);
        assertThat(Texts.truncate(name, 4)).isSameAs(name);
        assertThat(Texts.truncate(name, 20)).isSameAs(name);
    }

    @Test
    @DisplayName("Ex06.2 · (1) a negative limit is rejected")
    void truncate_rejectsNegativeLimit() {
        assertThatThrownBy(() -> Texts.truncate("ana", -1)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Ex06.2 · (2) reverse keeps an emoji intact, where reversing chars breaks its surrogate pair")
    void reverse_keepsSurrogatePairs() {
        String text = "ab" + EMOJI;
        char[] chars = text.toCharArray();
        char[] naive = new char[chars.length];
        for (int i = 0; i < chars.length; i++) {
            naive[i] = chars[chars.length - 1 - i];
        }

        assertThat(Texts.reverse(text)).isEqualTo(EMOJI + "ba");
        assertThat(Texts.reverse(Texts.reverse(text))).isEqualTo(text);
        assertThat(Character.isLowSurrogate(naive[0])).isTrue();
        assertThat(new String(naive).getBytes(StandardCharsets.UTF_8)).startsWith('?', '?', 'b');
    }

    @Test
    @DisplayName("Ex06.2 · (2) reverse works on code points, so a combining accent moves to the other letter")
    void reverse_movesCombiningMark() {
        String text = E_DECOMPOSED + "x";

        assertThat(Texts.reverse(text)).isEqualTo("x́e");
    }

    @Test
    @DisplayName("Ex06.2 · (3) decodeStrict decodes valid input with the charset it is given")
    void decodeStrict_decodesValidInput() throws MalformedTextException {
        byte[] utf8 = ("caf" + E_ACUTE).getBytes(StandardCharsets.UTF_8);
        byte[] latin1 = ("caf" + E_ACUTE).getBytes(StandardCharsets.ISO_8859_1);

        assertThat(Texts.decodeStrict(utf8, StandardCharsets.UTF_8)).isEqualTo("caf" + E_ACUTE);
        assertThat(Texts.decodeStrict(latin1, StandardCharsets.ISO_8859_1)).isEqualTo("caf" + E_ACUTE);
        assertThat(Texts.decodeStrict(new byte[0], StandardCharsets.UTF_8)).isEmpty();
    }

    @Test
    @DisplayName("Ex06.2 · (3) a malformed byte fails with its offset, where new String would give U+FFFD")
    void decodeStrict_reportsOffset_whereNewStringReplaces() {
        byte[] latin1 = ("caf" + E_ACUTE + "s").getBytes(StandardCharsets.ISO_8859_1);

        MalformedTextException e = catchThrowableOfType(
                MalformedTextException.class, () -> Texts.decodeStrict(latin1, StandardCharsets.UTF_8));

        assertThat(e.offset()).isEqualTo(3);
        assertThat(e.charsetName()).isEqualTo("UTF-8");
        assertThat(e).hasMessage("invalid UTF-8 at byte offset 3");
        assertThat(e.getCause()).isInstanceOf(MalformedInputException.class).hasMessage("Input length = 1");
        assertThat(new String(latin1, StandardCharsets.UTF_8)).isEqualTo("caf�s");
    }

    @Test
    @DisplayName("Ex06.2 · (3) a sequence cut off at the end of the input is reported at its first byte")
    void decodeStrict_reportsTruncatedSequence() {
        byte[] utf8 = ("ab" + EMOJI).getBytes(StandardCharsets.UTF_8);
        byte[] cut = Arrays.copyOf(utf8, 4); // "ab" + the first two of the emoji's four bytes

        MalformedTextException e = catchThrowableOfType(
                MalformedTextException.class, () -> Texts.decodeStrict(cut, StandardCharsets.UTF_8));

        assertThat(e.offset()).isEqualTo(2);
        assertThat(new String(cut, StandardCharsets.UTF_8)).isEqualTo("ab�");
    }

    @Test
    @DisplayName("Ex06.2 · (3) the charset is a parameter: a byte above 0x7F is malformed US-ASCII")
    void decodeStrict_usesTheGivenCharset() {
        byte[] latin1 = ("a" + E_ACUTE).getBytes(StandardCharsets.ISO_8859_1);

        MalformedTextException e = catchThrowableOfType(
                MalformedTextException.class, () -> Texts.decodeStrict(latin1, StandardCharsets.US_ASCII));

        assertThat(e.offset()).isEqualTo(1);
        assertThat(e.charsetName()).isEqualTo("US-ASCII");
    }

    @Test
    @DisplayName(
            "Ex06.2 · (3) a reader built from a Charset replaces bad bytes, one built from a REPORT decoder throws")
    void streamReaders_replaceOrReport() throws IOException {
        byte[] latin1 = ("caf" + E_ACUTE).getBytes(StandardCharsets.ISO_8859_1);

        try (Reader replacing = new InputStreamReader(new ByteArrayInputStream(latin1), StandardCharsets.UTF_8)) {
            StringWriter text = new StringWriter();
            replacing.transferTo(text);
            assertThat(text).hasToString("caf\uFFFD");
        }
        Reader reporting = new InputStreamReader(
                new ByteArrayInputStream(latin1),
                StandardCharsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT));
        try (reporting) {
            assertThatThrownBy(() -> reporting.transferTo(new StringWriter()))
                    .isInstanceOf(MalformedInputException.class);
        }
    }

    @Test
    @DisplayName("Ex06.2 · (3) MalformedTextException is checked: an IOException, not a RuntimeException")
    void malformedTextException_isChecked() {
        assertThat(IOException.class).isAssignableFrom(MalformedTextException.class);
        assertThat(RuntimeException.class.isAssignableFrom(MalformedTextException.class))
                .isFalse();
    }

    @Test
    @DisplayName("Ex06.2 · (4) fitsColumn counts UTF-8 bytes, not chars")
    void fitsColumn_countsUtf8Bytes() {
        String name = "Zoë Ångström"; // Zoë Ångström: 12 chars, 15 UTF-8 bytes

        assertThat(name).hasSize(12);
        assertThat(Texts.fitsColumn(name, 15)).isTrue();
        assertThat(Texts.fitsColumn(name, 14)).isFalse();
        assertThat(Texts.fitsColumn(name, 12)).isFalse();
    }

    @Test
    @DisplayName(
            "Ex06.2 · (4) truncateToBytes cuts between code points, where cutting the bytes leaves a broken sequence")
    void truncateToBytes_cutsAtCodePointBoundary() {
        String text = "a" + E_ACUTE + EMOJI; // 1 + 2 + 4 = 7 UTF-8 bytes

        assertThat(Texts.truncateToBytes(text, 7)).isSameAs(text);
        assertThat(Texts.truncateToBytes(text, 6)).isEqualTo("a" + E_ACUTE);
        assertThat(Texts.truncateToBytes(text, 3)).isEqualTo("a" + E_ACUTE);
        assertThat(Texts.truncateToBytes(text, 2)).isEqualTo("a");
        assertThat(Texts.truncateToBytes(text, 0)).isEmpty();
        byte[] cutBytes = Arrays.copyOf(text.getBytes(StandardCharsets.UTF_8), 2);
        assertThatThrownBy(() -> Texts.decodeStrict(cutBytes, StandardCharsets.UTF_8))
                .isInstanceOf(MalformedTextException.class);
    }

    @Test
    @DisplayName("Ex06.2 · (4) every byte limit gives the longest code-point prefix that fits")
    void truncateToBytes_isTheLongestPrefixThatFits() {
        String text = "Zoë€" + EMOJI + "x"; // 1 + 1 + 2 + 3 + 4 + 1 = 12 bytes
        assertThat(text.codePointCount(0, text.length())).isEqualTo(6);
        assertThat(text.getBytes(StandardCharsets.UTF_8)).hasSize(12);
        for (int max = 0; max <= 12; max++) {
            String cut = Texts.truncateToBytes(text, max);
            assertThat(text).startsWith(cut);
            assertThat(cut.getBytes(StandardCharsets.UTF_8).length).isLessThanOrEqualTo(max);
            assertThat(Texts.fitsColumn(cut, max)).isTrue();
            if (cut.length() < text.length()) {
                String longer = text.substring(0, text.offsetByCodePoints(cut.length(), 1));
                assertThat(Texts.fitsColumn(longer, max)).isFalse();
            }
        }
    }

    @Test
    @DisplayName("Ex06.2 · (4) a decomposed é takes 3 UTF-8 bytes and a composed one 2, so normalize before measuring")
    void fitsColumn_dependsOnNormalizationForm() {
        String composed = "Jos" + E_ACUTE;
        String decomposed = "Jos" + E_DECOMPOSED;

        assertThat(composed.getBytes(StandardCharsets.UTF_8)).hasSize(5);
        assertThat(decomposed.getBytes(StandardCharsets.UTF_8)).hasSize(6);
        assertThat(Texts.fitsColumn(decomposed, 5)).isFalse();
        assertThat(Texts.fitsColumn(Normalizer.normalize(decomposed, Normalizer.Form.NFC), 5))
                .isTrue();
    }

    @Test
    @DisplayName("Ex06.2 · (4) a lone surrogate is measured as the one ? byte that getBytes writes for it")
    void truncateToBytes_measuresLoneSurrogateLikeGetBytes() {
        String broken = "a\uD83Db";

        assertThat(broken.getBytes(StandardCharsets.UTF_8)).containsExactly('a', '?', 'b');
        assertThat(Texts.fitsColumn(broken, 3)).isTrue();
        assertThat(Texts.truncateToBytes(broken, 3)).isSameAs(broken);
        assertThat(Texts.truncateToBytes(broken, 2)).isEqualTo("a\uD83D");
    }

    @Test
    @DisplayName("Ex06.2 · (5) normalizedEquals treats a precomposed and a decomposed é as equal")
    void normalizedEquals_composedAndDecomposed() {
        String composed = "Jos" + E_ACUTE;
        String decomposed = "Jos" + E_DECOMPOSED;

        assertThat(composed).isNotEqualTo(decomposed);
        assertThat(Texts.normalizedEquals(composed, decomposed)).isTrue();
        assertThat(Texts.normalizedEquals(decomposed, composed)).isTrue();
        assertThat(Texts.normalizedEquals("Jose", composed)).isFalse();
    }

    @Test
    @DisplayName("Ex06.2 · (5) NFC keeps compatibility characters apart: the ﬁ ligature is not fi")
    void normalizedEquals_keepsCompatibilityCharactersApart() {
        String ligature = "ﬁ"; // LATIN SMALL LIGATURE FI

        assertThat(Texts.normalizedEquals(ligature, "fi")).isFalse();
        assertThat(Normalizer.normalize(ligature, Normalizer.Form.NFKC)).isEqualTo("fi");
    }
}
