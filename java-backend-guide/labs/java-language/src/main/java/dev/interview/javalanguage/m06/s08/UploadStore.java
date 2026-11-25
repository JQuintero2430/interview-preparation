package dev.interview.javalanguage.m06.s08;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

// Stores uploaded content under one directory, streaming it, never holding the whole upload in memory.
public final class UploadStore {

    private final Path base;

    public UploadStore(Path base) {
        this.base = base.toAbsolutePath().normalize();
    }

    public Path store(String fileName, InputStream content) throws IOException {
        Path target = resolveInside(fileName);
        // Files.copy reads and writes in chunks and fails if the target exists (no REPLACE_EXISTING).
        Files.copy(content, target);
        return target;
    }

    // A client-supplied name is untrusted: "../x" or an absolute path must not leave the base directory.
    public Path resolveInside(String fileName) {
        Path target = base.resolve(fileName).normalize();
        if (!target.startsWith(base) || target.equals(base)) {
            throw new IllegalArgumentException("file name escapes the upload directory: " + fileName);
        }
        return target;
    }
}
