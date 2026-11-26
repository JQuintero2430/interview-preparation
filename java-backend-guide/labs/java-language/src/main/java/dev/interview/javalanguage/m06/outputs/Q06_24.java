package dev.interview.javalanguage.m06.outputs;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// Q06.24: the cleanup job from §8 rewritten with Files, so every failure says why it happened.
public final class Q06_24 {

    private Q06_24() {}

    public record CleanupReport(List<Path> deleted, Map<Path, String> failures) {}

    public static CleanupReport deleteAll(List<Path> files) {
        List<Path> deleted = new ArrayList<>();
        Map<Path, String> failures = new LinkedHashMap<>();
        for (Path file : files) {
            try {
                // Absent is fine; anything else that stops the delete is an exception that names the cause.
                if (Files.deleteIfExists(file)) {
                    deleted.add(file);
                }
            } catch (IOException e) {
                failures.put(file, e.getClass().getSimpleName() + ": " + e.getMessage());
            }
        }
        return new CleanupReport(List.copyOf(deleted), Collections.unmodifiableMap(failures));
    }
}
