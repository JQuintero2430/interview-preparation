package dev.interview.javalanguage.m06.s08;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.ByteArrayInputStream;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class UploadStoreTest {

    @Test
    @DisplayName("M06 §8 · an upload is streamed into a file under the base directory")
    void store_streamsIntoBase(@TempDir Path dir) throws Exception {
        UploadStore store = new UploadStore(dir);
        byte[] content = new byte[100_000];
        content[99_999] = 7;

        Path stored = store.store("invoice.pdf", new ByteArrayInputStream(content));

        assertThat(stored).isEqualTo(dir.toAbsolutePath().normalize().resolve("invoice.pdf"));
        assertThat(Files.readAllBytes(stored)).isEqualTo(content);
    }

    @Test
    @DisplayName("M06 §8 · names that climb out of the base directory or are absolute are rejected")
    void traversal_isRejected(@TempDir Path dir) {
        UploadStore store = new UploadStore(dir.resolve("uploads"));

        assertThatThrownBy(() -> store.resolveInside("../secrets.txt")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> store.resolveInside("a/../../secrets.txt"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> store.resolveInside("/etc/passwd")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> store.resolveInside(".")).isInstanceOf(IllegalArgumentException.class);
        assertThat(store.resolveInside("2026/a/../invoice.pdf").getFileName()).hasToString("invoice.pdf");
    }

    @Test
    @DisplayName("M06 §8 · an existing file is not overwritten")
    void existingFile_isNotOverwritten(@TempDir Path dir) throws Exception {
        UploadStore store = new UploadStore(dir);
        store.store("a.txt", new ByteArrayInputStream(new byte[] {1}));

        assertThatThrownBy(() -> store.store("a.txt", new ByteArrayInputStream(new byte[] {2})))
                .isInstanceOf(FileAlreadyExistsException.class);
        assertThat(Files.readAllBytes(dir.resolve("a.txt"))).containsExactly(1);
    }
}
