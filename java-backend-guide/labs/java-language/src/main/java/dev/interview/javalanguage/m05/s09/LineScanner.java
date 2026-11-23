package dev.interview.javalanguage.m05.s09;

import static dev.interview.javalanguage.m05.s09.CheckedFunction.unchecked;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;

// Reads log files with streams that hold open file descriptors, and closes every one of them.
public final class LineScanner {

    private LineScanner() {}

    // Counts the lines containing needle across the regular files of dir.
    // The outer try closes the directory stream; flatMap closes each file's Stream<String> after reading it.
    public static long countMatching(Path dir, String needle) throws IOException {
        try (Stream<Path> files = Files.list(dir)) {
            return files.filter(Files::isRegularFile)
                    .flatMap(unchecked(Files::lines))
                    .filter(line -> line.contains(needle))
                    .count();
        }
    }

    // One Result per file: a missing or unreadable file becomes a Failure instead of ending the batch.
    public static List<Result<Long>> lineCounts(List<Path> files) {
        return files.stream().map(Result.attempt(LineScanner::countLines)).toList();
    }

    private static long countLines(Path file) throws IOException {
        try (Stream<String> lines = Files.lines(file)) {
            return lines.count();
        }
    }
}
