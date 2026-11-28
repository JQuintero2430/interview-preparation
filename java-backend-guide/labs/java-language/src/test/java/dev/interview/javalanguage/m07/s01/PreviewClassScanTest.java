package dev.interview.javalanguage.m07.s01;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.jar.JarEntry;
import java.util.jar.JarOutputStream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class PreviewClassScanTest {

    private static final Map<String, String> SOURCES = Map.of("app/Billing", """
            package app;
            public class Billing {
                public static String band(Object amount) {
                    return switch (amount) {
                        case Integer i when i > 1000 -> "high";
                        default -> "normal";
                    };
                }
            }
            """, "app/Bytes", """
            package app;
            public class Bytes {
                public static boolean fitsByte(int value) {
                    return value instanceof byte b;
                }
            }
            """);

    // One compilation with --enable-preview, as a build that turned the flag on for every module would do.
    private static Map<String, byte[]> compileWithPreviewEnabled() {
        var result = InMemoryCompiler.compile(SOURCES, "--release", "25", "--enable-preview");
        assertThat(result.success()).isTrue();
        return result.classes();
    }

    @Test
    @DisplayName("M07 §1 · the scan lists only the classes that use a preview feature")
    void scan_listsOnlyPreviewClasses(@TempDir Path dir) throws IOException {
        for (var entry : compileWithPreviewEnabled().entrySet()) {
            Path file = dir.resolve(entry.getKey().replace('.', '/') + ".class");
            Files.createDirectories(file.getParent());
            Files.write(file, entry.getValue());
        }
        Files.writeString(dir.resolve("app/README.txt"), "not a class");

        assertThat(PreviewClassScan.previewClasses(dir)).containsExactly(dir.resolve("app/Bytes.class"));
    }

    @Test
    @DisplayName("M07 §1 · the scan works inside a JAR through a zip file system")
    void scan_worksInsideAJar(@TempDir Path dir) throws IOException {
        Path jar = dir.resolve("app.jar");
        try (OutputStream out = Files.newOutputStream(jar);
                JarOutputStream jarOut = new JarOutputStream(out)) {
            for (var entry : compileWithPreviewEnabled().entrySet()) {
                jarOut.putNextEntry(new JarEntry(entry.getKey().replace('.', '/') + ".class"));
                jarOut.write(entry.getValue());
                jarOut.closeEntry();
            }
        }

        try (FileSystem zip = FileSystems.newFileSystem(jar)) {
            List<String> found = PreviewClassScan.previewClasses(zip.getPath("/")).stream()
                    .map(Path::toString)
                    .toList();
            assertThat(found).containsExactly("/app/Bytes.class");
        }
    }
}
