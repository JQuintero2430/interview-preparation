package dev.interview.javalanguage.m06.ex2;

import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.List;

// Runs every Texts method on fixed inputs. The test runs it in-process and in a child JVM whose default
// charset is not UTF-8, and compares the two. Results are printed as hex so stdout's encoding cannot change them.
public final class TextsProbe {

    private static final String TEXT = "José 😀 é";
    private static final byte[] LATIN1 = "café".getBytes(StandardCharsets.ISO_8859_1);

    private TextsProbe() {}

    public static void main(String[] args) {
        System.out.println("default=" + Charset.defaultCharset().name());
        results().forEach(System.out::println);
    }

    static List<String> results() {
        return List.of(
                "truncate=" + hex(Texts.truncate(TEXT, 6)),
                "reverse=" + hex(Texts.reverse(TEXT)),
                "decodeStrict=" + decodeStrict(TEXT.getBytes(StandardCharsets.UTF_8)),
                "decodeStrictLatin1=" + decodeStrict(LATIN1),
                "fitsColumn=" + Texts.fitsColumn(TEXT, 14) + "," + Texts.fitsColumn(TEXT, 13),
                "truncateToBytes=" + hex(Texts.truncateToBytes(TEXT, 9)),
                "normalizedEquals=" + Texts.normalizedEquals("é", "é"));
    }

    private static String decodeStrict(byte[] bytes) {
        try {
            return hex(Texts.decodeStrict(bytes, StandardCharsets.UTF_8));
        } catch (MalformedTextException e) {
            return "malformed@" + e.offset();
        }
    }

    // The UTF-16BE bytes of the string: an exact picture of its chars that needs no default charset.
    private static String hex(String s) {
        return HexFormat.of().formatHex(s.getBytes(StandardCharsets.UTF_16BE));
    }
}
