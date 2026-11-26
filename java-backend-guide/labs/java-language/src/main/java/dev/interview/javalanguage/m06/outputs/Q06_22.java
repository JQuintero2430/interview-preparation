package dev.interview.javalanguage.m06.outputs;

import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.Optional;

// Q06.22: diagnose mojibake from the bytes, and repair stored text only where the repair is provably exact.
public final class Q06_22 {

    private Q06_22() {}

    // The first piece of evidence: the bytes, not what a viewer shows.
    public static String hex(String text, Charset charset) {
        return HexFormat.ofDelimiter(" ").formatHex(text.getBytes(charset));
    }

    // Undoes one wrong decode of UTF-8 bytes with a single-byte charset (the one the evidence names).
    // Both coders report errors by default, so text that does not round-trip exactly
    // (correct text, or text that already lost bytes) is left alone.
    public static Optional<String> undoWrongDecode(String stored, Charset wrongCharset) {
        try {
            ByteBuffer originalBytes = wrongCharset.newEncoder().encode(CharBuffer.wrap(stored));
            return Optional.of(
                    StandardCharsets.UTF_8.newDecoder().decode(originalBytes).toString());
        } catch (CharacterCodingException notMojibake) {
            return Optional.empty();
        }
    }
}
