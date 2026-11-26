package dev.interview.javalanguage.m06.ex1;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

// The production adapter: one new UTF-8 file per part, never overwriting an earlier export of the batch.
public final class FileSinkFactory implements SinkFactory {

    private final Path directory;

    public FileSinkFactory(Path directory) {
        this.directory = directory.toAbsolutePath().normalize();
    }

    @Override
    public Sink open(String batchId, BatchPart part) throws IOException {
        Path file = fileFor(batchId, part);
        return new WriterSink(Files.newBufferedWriter(file, StandardCharsets.UTF_8, StandardOpenOption.CREATE_NEW));
    }

    // The batch id comes from upstream data: it must not choose a file outside the export directory.
    Path fileFor(String batchId, BatchPart part) {
        Path file = directory.resolve(batchId + part.fileSuffix()).normalize();
        if (!directory.equals(file.getParent())) {
            throw new IllegalArgumentException("batch id escapes the export directory: " + batchId);
        }
        return file;
    }

    private record WriterSink(BufferedWriter writer) implements Sink {

        @Override
        public void write(String record) throws IOException {
            writer.write(record);
            writer.write('\n');
        }

        // BufferedWriter.close() flushes the buffer, then closes the file.
        @Override
        public void close() throws IOException {
            writer.close();
        }
    }
}
