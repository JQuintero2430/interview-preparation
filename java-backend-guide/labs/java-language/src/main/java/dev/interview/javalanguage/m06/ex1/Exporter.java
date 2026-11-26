package dev.interview.javalanguage.m06.ex1;

import java.io.IOException;
import java.util.List;

// Writes one batch to its data sink and its manifest sink, opened per batch and closed on every path.
public final class Exporter {

    private final SinkFactory sinks;

    public Exporter(SinkFactory sinks) {
        this.sinks = sinks;
    }

    public int export(String batchId, List<String> records) {
        try (Sink data = sinks.open(batchId, BatchPart.DATA);
                Sink manifest = sinks.open(batchId, BatchPart.MANIFEST)) {
            for (String record : records) {
                data.write(Records.validated(record));
            }
            manifest.write("records=" + records.size());
            return records.size();
        } catch (IOException e) {
            throw new ExportFailedException(batchId, e);
        }
    }
}
