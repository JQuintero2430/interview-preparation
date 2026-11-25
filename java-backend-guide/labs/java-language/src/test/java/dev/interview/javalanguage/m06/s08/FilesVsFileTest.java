package dev.interview.javalanguage.m06.s08;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.File;
import java.nio.file.DirectoryNotEmptyException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class FilesVsFileTest {

    @Test
    @DisplayName("M06 §8 · File.delete returns false where Files.delete throws NoSuchFileException")
    void missingFile_falseVersusException(@TempDir Path dir) throws Exception {
        Path missing = dir.resolve("missing.txt");

        assertThat(missing.toFile().delete()).isFalse();
        assertThatThrownBy(() -> Files.delete(missing))
                .isInstanceOf(NoSuchFileException.class)
                .hasMessageContaining("missing.txt");
        assertThat(Files.deleteIfExists(missing)).isFalse();
    }

    @Test
    @DisplayName("M06 §8 · deleting a non-empty directory: false from File, DirectoryNotEmptyException from Files")
    void nonEmptyDirectory_falseVersusException(@TempDir Path dir) throws Exception {
        Path reports = Files.createDirectory(dir.resolve("reports"));
        Files.writeString(reports.resolve("day.csv"), "x");
        File legacy = reports.toFile();

        assertThat(legacy.delete()).isFalse();
        assertThatThrownBy(() -> Files.delete(reports)).isInstanceOf(DirectoryNotEmptyException.class);
        assertThat(legacy.toPath()).isEqualTo(reports);
    }

    @Test
    @DisplayName("M06 §8 · normalize removes . and name/.., and resolve returns an absolute argument as is")
    void normalizeAndResolve() {
        Path base = Path.of("/srv/uploads");

        assertThat(Path.of("a/./b/../c").normalize()).isEqualTo(Path.of("a/c"));
        assertThat(base.resolve("../etc/passwd").normalize()).isEqualTo(Path.of("/srv/etc/passwd"));
        assertThat(base.resolve("/etc/passwd")).isEqualTo(Path.of("/etc/passwd"));
        assertThat(Path.of("/srv/uploads-old").startsWith(base)).isFalse();
    }
}
