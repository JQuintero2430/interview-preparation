package dev.interview.javalanguage.m06.s08;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class RandomAccessTest {

    @Test
    @DisplayName("M06 §8 · RandomAccessFile seeks and overwrites in place")
    void randomAccessFile_seeksAndOverwrites(@TempDir Path dir) throws Exception {
        Path file = Files.writeString(dir.resolve("records.dat"), "AAAABBBBCCCC", StandardCharsets.US_ASCII);

        try (RandomAccessFile raf = new RandomAccessFile(file.toFile(), "rw")) {
            raf.seek(4);
            raf.write("bbbb".getBytes(StandardCharsets.US_ASCII));
            raf.seek(100);
            assertThat(raf.length()).isEqualTo(12);
        }

        assertThat(Files.readString(file, StandardCharsets.US_ASCII)).isEqualTo("AAAAbbbbCCCC");
    }

    @Test
    @DisplayName("M06 §8 · a ByteBuffer must be flipped before it is read")
    void byteBuffer_needsFlip() {
        ByteBuffer buffer = ByteBuffer.allocate(8);
        buffer.put(new byte[] {10, 20, 30});

        assertThat(buffer.position()).isEqualTo(3);
        assertThat(buffer.remaining()).isEqualTo(5);
        assertThat(buffer.get()).isZero(); // reads the unwritten slot after the data

        buffer.position(3).flip();

        assertThat(buffer.position()).isZero();
        assertThat(buffer.limit()).isEqualTo(3);
        assertThat(buffer.capacity()).isEqualTo(8);
        assertThat(new byte[] {buffer.get(), buffer.get(), buffer.get()}).containsExactly(10, 20, 30);
        assertThat(buffer.hasRemaining()).isFalse();
    }

    @Test
    @DisplayName("M06 §8 · a FileChannel reads at its position or at an absolute one, and transfers to another channel")
    void fileChannel_positionsAndTransfers(@TempDir Path dir) throws Exception {
        Path source = Files.writeString(dir.resolve("in.dat"), "0123456789", StandardCharsets.US_ASCII);
        Path target = dir.resolve("out.dat");

        try (FileChannel in = FileChannel.open(source);
                FileChannel out = FileChannel.open(target, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE)) {
            ByteBuffer four = ByteBuffer.allocate(4);
            in.read(four);
            assertThat(in.position()).isEqualTo(4);
            four.clear();
            in.read(four, 8);
            assertThat(in.position()).isEqualTo(4);
            assertThat(new String(four.array(), 0, four.position(), StandardCharsets.US_ASCII))
                    .isEqualTo("89");

            long sent = in.transferTo(0, in.size(), out);
            assertThat(sent).isEqualTo(10);
        }

        assertThat(Files.readString(target, StandardCharsets.US_ASCII)).isEqualTo("0123456789");
    }
}
