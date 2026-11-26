package dev.interview.javalanguage.m06.ex1;

import java.io.IOException;
import java.io.Serial;
import java.util.Objects;

// The exporter's one failure type: unchecked, it names the batch and keeps the I/O failure as its cause.
public class ExportFailedException extends RuntimeException {

    @Serial
    private static final long serialVersionUID = 1L;

    private final String batchId;

    public ExportFailedException(String batchId, IOException cause) {
        super("Failed to export batch " + batchId, Objects.requireNonNull(cause));
        this.batchId = Objects.requireNonNull(batchId);
    }

    public String batchId() {
        return batchId;
    }
}
