package dev.interview.javalanguage.m06.s07;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.ByteBuffer;
import java.nio.charset.CharsetDecoder;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.MalformedInputException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class CharsetDecodingTest {

    private static final byte[] LATIN1_CAFE = {'c', 'a', 'f', (byte) 0xE9}; // "café" in ISO-8859-1

    @Test
    @DisplayName("M06 §7 · UTF-8 bytes decoded as ISO-8859-1 produce mojibake")
    void utf8DecodedAsLatin1_isMojibake_andReversible() {
        byte[] utf8 = "café".getBytes(StandardCharsets.UTF_8);

        String wrong = new String(utf8, StandardCharsets.ISO_8859_1);

        assertThat(utf8).hasSize(5);
        assertThat(wrong).isEqualTo("cafÃ©");
        // ISO-8859-1 maps every byte to a character, so no byte was lost and the damage can be undone.
        assertThat(new String(wrong.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8))
                .isEqualTo("café");
        byte[] everyByte = new byte[256];
        for (int i = 0; i < everyByte.length; i++) {
            everyByte[i] = (byte) i;
        }
        String latin1 = new String(everyByte, StandardCharsets.ISO_8859_1);
        assertThat(latin1).hasSize(256);
        assertThat(latin1.getBytes(StandardCharsets.ISO_8859_1)).isEqualTo(everyByte);
    }

    @Test
    @DisplayName("M06 §7 · new String with UTF-8 replaces malformed bytes with U+FFFD")
    void newString_replacesMalformedInput() {
        String decoded = new String(LATIN1_CAFE, StandardCharsets.UTF_8);

        assertThat(decoded).isEqualTo("caf�");
        // The original byte is gone: encoding again cannot bring 0xE9 back.
        assertThat(decoded.getBytes(StandardCharsets.ISO_8859_1)).containsExactly('c', 'a', 'f', '?');
    }

    @Test
    @DisplayName("M06 §7 · a REPORT decoder throws MalformedInputException")
    void reportingDecoder_throws() {
        CharsetDecoder decoder = StandardCharsets.UTF_8.newDecoder();

        assertThat(decoder.malformedInputAction()).isEqualTo(CodingErrorAction.REPORT);
        assertThatThrownBy(() -> decoder.decode(ByteBuffer.wrap(LATIN1_CAFE)))
                .isInstanceOf(MalformedInputException.class)
                .satisfies(e -> assertThat(((MalformedInputException) e).getInputLength())
                        .isEqualTo(1));
    }

    @Test
    @DisplayName("M06 §7 · a decoder set to REPLACE behaves like new String")
    void replacingDecoder_writesReplacement() throws Exception {
        CharsetDecoder decoder = StandardCharsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPLACE);

        assertThat(decoder.replacement()).isEqualTo("�");
        assertThat(decoder.decode(ByteBuffer.wrap(LATIN1_CAFE)).toString()).isEqualTo("caf�");
    }

    @Test
    @DisplayName("M06 §7 · Files.readString throws MalformedInputException instead of replacing")
    void filesReadString_reportsMalformedInput(@TempDir Path dir) throws Exception {
        Path file = Files.write(dir.resolve("latin1.txt"), LATIN1_CAFE);

        assertThatThrownBy(() -> Files.readString(file)).isInstanceOf(MalformedInputException.class);
        assertThatThrownBy(() -> Files.readAllLines(file)).isInstanceOf(MalformedInputException.class);
        assertThat(Files.readString(file, StandardCharsets.ISO_8859_1)).isEqualTo("café");
    }

    @Test
    @DisplayName("M06 §7 · the UTF-8 decoder keeps a leading BOM as U+FEFF; the UTF-16 decoder consumes it")
    void byteOrderMark_keptByUtf8_consumedByUtf16() {
        byte[] utf8WithBom = {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF, 'i', 'd'};
        byte[] utf16WithBom = {(byte) 0xFE, (byte) 0xFF, 0, 'i', 0, 'd'};

        String utf8 = new String(utf8WithBom, StandardCharsets.UTF_8);

        assertThat(utf8).isEqualTo("﻿id").hasSize(3);
        assertThat(utf8.equals("id")).isFalse();
        assertThat(new String(utf16WithBom, StandardCharsets.UTF_16)).isEqualTo("id");
        assertThat(new String(utf16WithBom, StandardCharsets.UTF_16BE)).isEqualTo("﻿id");
    }

    @Test
    @DisplayName("M06 §7 · length() counts UTF-16 units, not the bytes a byte-limited column stores")
    void charCount_differsFromUtf8ByteCount() {
        String name = "Zoë Ångström";

        assertThat(name.length()).isEqualTo(12);
        assertThat(name.getBytes(StandardCharsets.UTF_8)).hasSize(15);
    }
}
