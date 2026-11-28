package dev.interview.javalanguage.m07.s01;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;

// A build gate: lists the class files under a directory (or the root of a JAR file system)
// that depend on preview features, so a pipeline can refuse to ship them.
public final class PreviewClassScan {

    private static final int HEADER_BYTES = 8;

    private PreviewClassScan() {}

    public static List<Path> previewClasses(Path root) throws IOException {
        try (Stream<Path> files = Files.walk(root)) {
            return files.filter(PreviewClassScan::isClassFile)
                    .filter(PreviewClassScan::dependsOnPreview)
                    .sorted()
                    .toList();
        }
    }

    private static boolean isClassFile(Path path) {
        return Files.isRegularFile(path) && path.toString().endsWith(".class");
    }

    private static boolean dependsOnPreview(Path classFile) {
        try (InputStream in = Files.newInputStream(classFile)) {
            return ClassFileVersion.of(in.readNBytes(HEADER_BYTES)).dependsOnPreview();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
