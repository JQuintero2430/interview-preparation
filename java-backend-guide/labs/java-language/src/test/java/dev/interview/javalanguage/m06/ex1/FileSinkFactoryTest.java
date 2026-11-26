package dev.interview.javalanguage.m06.ex1;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class FileSinkFactoryTest {

    @TempDir
    Path dir;

    @Test
    @DisplayName(
            "Ex06.1 · (1) with the file adapter both files are complete after export, because closing flushed them")
    void files_areCompleteAfterExport() throws IOException {
        new Exporter(new FileSinkFactory(dir)).export("b-7", List.of("José;120.00", "Zoë;80.50"));

        assertThat(Files.readString(dir.resolve("b-7.csv"), StandardCharsets.UTF_8))
                .isEqualTo("José;120.00\nZoë;80.50\n");
        assertThat(Files.readString(dir.resolve("b-7.manifest"), StandardCharsets.UTF_8))
                .isEqualTo("records=2\n");
    }

    @Test
    @DisplayName(
            "Ex06.1 · (3) a missing export directory surfaces as ExportFailedException caused by NoSuchFileException")
    void missingDirectory_isTranslated() {
        Exporter exporter = new Exporter(new FileSinkFactory(dir.resolve("not-mounted")));

        Throwable thrown = catchThrowable(() -> exporter.export("b-7", List.of("pay-1;120.00")));

        assertThat(thrown).isInstanceOf(ExportFailedException.class).hasMessage("Failed to export batch b-7");
        assertThat(thrown.getCause()).isInstanceOf(NoSuchFileException.class);
    }

    @Test
    @DisplayName("Ex06.1 · (3) exporting the same batch twice fails with FileAlreadyExistsException as the cause")
    void secondExport_isTranslated_andKeepsTheFirstFile() throws IOException {
        Exporter exporter = new Exporter(new FileSinkFactory(dir));
        exporter.export("b-7", List.of("pay-1;120.00"));

        Throwable thrown = catchThrowable(() -> exporter.export("b-7", List.of("pay-9;1.00")));

        assertThat(thrown).isInstanceOf(ExportFailedException.class);
        assertThat(thrown.getCause()).isInstanceOf(FileAlreadyExistsException.class);
        assertThat(Files.readString(dir.resolve("b-7.csv"), StandardCharsets.UTF_8))
                .isEqualTo("pay-1;120.00\n");
    }

    @Test
    @DisplayName("Ex06.1 · (5) a batch id that escapes the directory is an IllegalArgumentException, not translated")
    void escapingBatchId_isRejected() throws IOException {
        Path exports = Files.createDirectory(dir.resolve("exports"));
        Exporter exporter = new Exporter(new FileSinkFactory(exports));

        Throwable thrown = catchThrowable(() -> exporter.export("../b-7", List.of("pay-1;120.00")));

        assertThat(thrown)
                .isExactlyInstanceOf(IllegalArgumentException.class)
                .hasMessage("batch id escapes the export directory: ../b-7");
        try (Stream<Path> files = Files.list(dir)) {
            assertThat(files).containsExactly(exports);
        }
    }
}
