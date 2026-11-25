package dev.interview.javalanguage.m06.s07;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.text.BreakIterator;
import java.text.Normalizer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CodePointsTest {

    private static final String GRINNING_FACE = "😀"; // U+1F600, outside the BMP

    @Test
    @DisplayName("M06 §7 · an emoji has length 2 and one code point")
    void emoji_isTwoCharsAndOneCodePoint() {
        assertThat(GRINNING_FACE.length()).isEqualTo(2);
        assertThat(GRINNING_FACE.codePointCount(0, GRINNING_FACE.length())).isEqualTo(1);
        assertThat(GRINNING_FACE.codePoints().count()).isEqualTo(1);
        assertThat(GRINNING_FACE.codePointAt(0)).isEqualTo(0x1F600);
        assertThat(Character.isHighSurrogate(GRINNING_FACE.charAt(0))).isTrue();
        assertThat(Character.isLowSurrogate(GRINNING_FACE.charAt(1))).isTrue();
        assertThat(Character.charCount(0x1F600)).isEqualTo(2);
        assertThat(new String(Character.toChars(0x1F600))).isEqualTo(GRINNING_FACE);
    }

    @Test
    @DisplayName("M06 §7 · substring through a surrogate pair leaves a lone surrogate")
    void substringThroughPair_leavesLoneSurrogate() {
        String name = "ana" + GRINNING_FACE;

        String cut = name.substring(0, 4);

        assertThat(Character.isHighSurrogate(cut.charAt(3))).isTrue();
        assertThat(cut.codePointCount(0, cut.length())).isEqualTo(4);
        // A lone surrogate cannot be encoded, so getBytes writes the encoder's replacement, '?'.
        assertThat(new String(cut.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8))
                .isEqualTo("ana?");
        int cutByCodePoints = name.offsetByCodePoints(0, 4);
        assertThat(name.substring(0, cutByCodePoints)).isEqualTo(name);
    }

    @Test
    @DisplayName("M06 §7 · char methods cannot see supplementary characters; int methods can")
    void charOverloads_treatSurrogatesAsUndefined() {
        // The Character Javadoc's own examples: a high surrogate alone and a CJK ideograph at U+2F81A.
        assertThat(Character.isLetter('\uD840')).isFalse();
        assertThat(Character.isLetter(0x2F81A)).isTrue();
        assertThat(Character.isLetter(GRINNING_FACE.charAt(0))).isFalse();
    }

    @Test
    @DisplayName("M06 §7 · 'a' + 1 is the int 98")
    void charArithmetic_promotesToInt() {
        Object sum = 'a' + 1;
        Object twoChars = 'a' + 'b';

        assertThat(sum).isInstanceOf(Integer.class).isEqualTo(98);
        assertThat(twoChars).isEqualTo(195);
        assertThat((char) ('a' + 1)).isEqualTo('b');
        assertThat("" + 'a' + 1).isEqualTo("a1");
        assertThat('a' + 1 + "").isEqualTo("98");
    }

    @Test
    @DisplayName("M06 §7 · UTF-8 uses 1 to 4 bytes per code point, UTF-16 2 or 4, ISO-8859-1 1 or none")
    void encodings_useDifferentByteCounts() {
        String[] samples = {"A", "é", "€", GRINNING_FACE};
        int[] utf8 = {1, 2, 3, 4};
        int[] utf16 = {2, 2, 2, 4};

        for (int i = 0; i < samples.length; i++) {
            assertThat(samples[i].getBytes(StandardCharsets.UTF_8)).hasSize(utf8[i]);
            assertThat(samples[i].getBytes(StandardCharsets.UTF_16BE)).hasSize(utf16[i]);
        }
        assertThat(new String(Character.toChars(0x10FFFF)).getBytes(StandardCharsets.UTF_8))
                .hasSize(4);
        assertThat("é".getBytes(StandardCharsets.ISO_8859_1)).containsExactly(0xE9);
        // € is not in ISO-8859-1 and é is not in US-ASCII: getBytes silently writes '?'.
        assertThat("€".getBytes(StandardCharsets.ISO_8859_1)).containsExactly('?');
        assertThat("é".getBytes(StandardCharsets.US_ASCII)).containsExactly('?');
    }

    @Test
    @DisplayName("M06 §7 · a decomposed é is two code points, one user-perceived character, and equal after NFC")
    void decomposedAccent_isOneGraphemeAndNormalizes() {
        String precomposed = "é";
        String decomposed = "é";
        String flag = "🇨🇴"; // two regional indicators, shown as one flag

        assertThat(precomposed.equals(decomposed)).isFalse();
        assertThat(decomposed.length()).isEqualTo(2);
        assertThat(graphemes(decomposed)).isEqualTo(1);
        assertThat(flag.length()).isEqualTo(4);
        assertThat(flag.codePointCount(0, flag.length())).isEqualTo(2);
        assertThat(graphemes(flag)).isEqualTo(1);
        assertThat(Normalizer.normalize(decomposed, Normalizer.Form.NFC)).isEqualTo(precomposed);
        assertThat(Normalizer.normalize(precomposed, Normalizer.Form.NFD)).isEqualTo(decomposed);
    }

    private static int graphemes(String text) {
        BreakIterator boundaries = BreakIterator.getCharacterInstance();
        boundaries.setText(text);
        int count = 0;
        while (boundaries.next() != BreakIterator.DONE) {
            count++;
        }
        return count;
    }
}
