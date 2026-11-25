package dev.interview.javalanguage.m06.s08;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.nio.charset.MalformedInputException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class StreamBasicsTest {

    @Test
    @DisplayName("M06 §8 · read returns -1 and readLine returns null at end of stream")
    void endOfStream_isMinusOneOrNull() throws Exception {
        InputStream bytes = new ByteArrayInputStream(new byte[] {(byte) 0xFF});
        BufferedReader lines = new BufferedReader(new StringReader("a\r\nb"));

        // 0xFF comes back as 255, not -1: read returns an int so that -1 can mean "no more bytes".
        assertThat(bytes.read()).isEqualTo(255);
        assertThat(bytes.read()).isEqualTo(-1);
        // Narrowed to byte, the data value 255 and the end marker -1 become the same value.
        assertThat((byte) 255).isEqualTo((byte) -1);
        assertThat(lines.readLine()).isEqualTo("a");
        assertThat(lines.readLine()).isEqualTo("b");
        assertThat(lines.readLine()).isNull();
    }

    @Test
    @DisplayName("M06 §8 · an InputStreamReader decodes with the charset it is given")
    void inputStreamReader_usesGivenCharset() throws Exception {
        byte[] utf8 = "café".getBytes(StandardCharsets.UTF_8);

        String asUtf8 = readAll(new InputStreamReader(new ByteArrayInputStream(utf8), StandardCharsets.UTF_8));
        String asLatin1 = readAll(new InputStreamReader(new ByteArrayInputStream(utf8), StandardCharsets.ISO_8859_1));

        assertThat(asUtf8).isEqualTo("café");
        assertThat(asLatin1).isEqualTo("cafÃ©");
    }

    @Test
    @DisplayName("M06 §8 · Files.newBufferedReader reads UTF-8 by default and reports malformed input")
    void newBufferedReader_isUtf8AndStrict(@TempDir Path dir) throws Exception {
        Path utf8 = Files.writeString(dir.resolve("utf8.txt"), "café\n", StandardCharsets.UTF_8);
        Path latin1 = Files.writeString(dir.resolve("latin1.txt"), "café\n", StandardCharsets.ISO_8859_1);

        try (BufferedReader reader = Files.newBufferedReader(utf8)) {
            assertThat(reader.readLine()).isEqualTo("café");
        }
        try (BufferedReader reader = Files.newBufferedReader(latin1)) {
            assertThatThrownBy(reader::readLine).isInstanceOf(MalformedInputException.class);
        }
    }

    @Test
    @DisplayName("M06 §8 · a BufferedInputStream turns many one-byte reads into a few large ones")
    void buffering_reducesUnderlyingReads() throws Exception {
        byte[] content = new byte[10_000];
        CountingInputStream unbuffered = new CountingInputStream(content);
        CountingInputStream underBuffer = new CountingInputStream(content);

        drainByteByByte(unbuffered);
        drainByteByByte(new BufferedInputStream(underBuffer));

        assertThat(unbuffered.readCalls()).isEqualTo(10_001);
        assertThat(underBuffer.readCalls()).isLessThan(10);
    }

    @Test
    @DisplayName("M06 §8 · Data streams decorate a byte stream with typed values")
    void dataStreams_decorateWithTypedValues() throws Exception {
        ByteArrayOutputStream sink = new ByteArrayOutputStream();
        try (DataOutputStream out = new DataOutputStream(new BufferedOutputStream(sink))) {
            out.writeInt(42);
            out.writeLong(7L);
        }

        try (DataInputStream in = new DataInputStream(new ByteArrayInputStream(sink.toByteArray()))) {
            assertThat(sink.size()).isEqualTo(12);
            assertThat(in.readInt()).isEqualTo(42);
            assertThat(in.readLong()).isEqualTo(7L);
            assertThat(in.read()).isEqualTo(-1);
        }
    }

    @Test
    @DisplayName("M06 §8 · transferTo copies everything and leaves the input at end of stream")
    void transferTo_copiesToEnd() throws Exception {
        InputStream in = new ByteArrayInputStream(new byte[20_000]);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        long copied = in.transferTo(out);

        assertThat(copied).isEqualTo(20_000);
        assertThat(out.size()).isEqualTo(20_000);
        assertThat(in.read()).isEqualTo(-1);
    }

    @Test
    @DisplayName("M06 §8 · flush passes buffered bytes on and leaves the stream open")
    void flush_doesNotClose() throws Exception {
        ByteArrayOutputStream sink = new ByteArrayOutputStream();
        BufferedOutputStream out = new BufferedOutputStream(sink);

        out.write(new byte[] {1, 2, 3});
        assertThat(sink.size()).isZero();
        out.flush();
        assertThat(sink.size()).isEqualTo(3);
        out.write(4);
        out.close();
        assertThat(sink.toByteArray()).containsExactly(1, 2, 3, 4);
    }

    private static String readAll(InputStreamReader reader) throws Exception {
        try (BufferedReader buffered = new BufferedReader(reader)) {
            return buffered.readLine();
        }
    }

    private static void drainByteByByte(InputStream in) throws Exception {
        while (in.read() != -1) {
            // consume
        }
    }
}
