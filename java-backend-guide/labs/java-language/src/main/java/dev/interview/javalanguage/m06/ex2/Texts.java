package dev.interview.javalanguage.m06.ex2;

import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;
import java.nio.charset.CharsetDecoder;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.Objects;

// Text operations that count code points, not UTF-16 chars, and that name every charset they use.
public final class Texts {

    private Texts() {}

    // The first maxCodePoints code points; the same instance when the text is already short enough.
    public static String truncate(String s, int maxCodePoints) {
        requireNonNegative(maxCodePoints);
        if (s.codePointCount(0, s.length()) <= maxCodePoints) {
            return s;
        }
        return s.substring(0, s.offsetByCodePoints(0, maxCodePoints));
    }

    // Reverses code points, so a surrogate pair stays in high-low order.
    public static String reverse(String s) {
        int[] codePoints = s.codePoints().toArray();
        int[] reversed = new int[codePoints.length];
        for (int i = 0; i < codePoints.length; i++) {
            reversed[i] = codePoints[codePoints.length - 1 - i];
        }
        return new String(reversed, 0, reversed.length);
    }

    // Decodes or fails: never replaces a bad byte with U+FFFD the way new String(bytes, charset) does.
    public static String decodeStrict(byte[] bytes, Charset charset) throws MalformedTextException {
        CharsetDecoder decoder = charset.newDecoder()
                .onMalformedInput(CodingErrorAction.REPORT)
                .onUnmappableCharacter(CodingErrorAction.REPORT);
        ByteBuffer in = ByteBuffer.wrap(bytes);
        try {
            return decoder.decode(in).toString();
        } catch (CharacterCodingException e) {
            // On a reported error the buffer's position is the first byte of the bad sequence.
            throw new MalformedTextException(charset, in.position(), e);
        }
    }

    // Whether the UTF-8 encoding of s fits a column limited to maxBytes bytes.
    public static boolean fitsColumn(String s, int maxBytes) {
        requireNonNegative(maxBytes);
        return s.getBytes(StandardCharsets.UTF_8).length <= maxBytes;
    }

    // The longest prefix, cut between code points, whose UTF-8 encoding fits in maxBytes bytes.
    public static String truncateToBytes(String s, int maxBytes) {
        requireNonNegative(maxBytes);
        int bytes = 0;
        int end = 0;
        while (end < s.length()) {
            int codePoint = s.codePointAt(end);
            bytes += utf8Length(codePoint);
            if (bytes > maxBytes) {
                return s.substring(0, end);
            }
            end += Character.charCount(codePoint);
        }
        return s;
    }

    // Equal after canonical composition (NFC): a precomposed and a decomposed é are the same text.
    public static boolean normalizedEquals(String a, String b) {
        return Normalizer.normalize(Objects.requireNonNull(a), Normalizer.Form.NFC)
                .equals(Normalizer.normalize(Objects.requireNonNull(b), Normalizer.Form.NFC));
    }

    // Measured with the same encoder getBytes uses, so a lone surrogate counts as its one replacement byte.
    private static int utf8Length(int codePoint) {
        return Character.toString(codePoint).getBytes(StandardCharsets.UTF_8).length;
    }

    private static void requireNonNegative(int limit) {
        if (limit < 0) {
            throw new IllegalArgumentException("limit must not be negative: " + limit);
        }
    }
}
