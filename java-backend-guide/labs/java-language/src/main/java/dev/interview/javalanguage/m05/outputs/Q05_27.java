package dev.interview.javalanguage.m05.outputs;

import dev.interview.javalanguage.m05.s09.Result;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.IntStream;
import java.util.stream.Stream;

// Module 05 Q05.27: an exception caught and logged inside a lambda turns a failed file into a silent success.
public final class Q05_27 {

    private static final System.Logger LOG = System.getLogger(Q05_27.class.getName());

    private Q05_27() {}

    // What the job reports at the end: files seen, records imported, and the files that failed.
    public record ImportReport(int files, long records, List<Path> failed) {

        public ImportReport {
            failed = List.copyOf(failed);
        }

        public boolean succeeded() {
            return failed.isEmpty();
        }
    }

    // Bug: a failed file is logged and counted as zero records, so the report always says success.
    public static ImportReport importSwallowing(List<Path> files) {
        long records = files.stream()
                .mapToLong(file -> {
                    try {
                        return countRecords(file);
                    } catch (IOException e) {
                        LOG.log(System.Logger.Level.WARNING, "skipping " + file, e);
                        return 0;
                    }
                })
                .sum();
        return new ImportReport(files.size(), records, List.of());
    }

    // Fix: one Result per file, so every failure is counted and reported instead of hidden.
    public static ImportReport importReporting(List<Path> files) {
        List<Result<Long>> results =
                files.stream().map(Result.attempt(Q05_27::countRecords)).toList();
        long records = results.stream()
                .mapToLong(result -> result instanceof Result.Success<Long>(Long count) ? count : 0)
                .sum();
        List<Path> failed = IntStream.range(0, files.size())
                .filter(i -> results.get(i) instanceof Result.Failure<Long>)
                .mapToObj(files::get)
                .toList();
        return new ImportReport(files.size(), records, failed);
    }

    private static long countRecords(Path file) throws IOException {
        try (Stream<String> lines = Files.lines(file)) {
            return lines.count();
        }
    }
}
