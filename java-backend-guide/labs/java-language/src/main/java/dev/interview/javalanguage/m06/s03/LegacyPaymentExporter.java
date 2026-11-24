package dev.interview.javalanguage.m06.s03;

import java.io.IOException;
import java.util.List;

// The pre-Java 7 shape: close() in finally. If the body and close() both fail, close()'s exception wins.
public final class LegacyPaymentExporter {

    private final ChannelFactory channels;

    public LegacyPaymentExporter(ChannelFactory channels) {
        this.channels = channels;
    }

    public void export(String batchId, List<String> records) {
        try {
            ExportChannel channel = channels.open(batchId);
            try {
                for (String record : records) {
                    channel.write(RecordValidator.validated(record));
                }
            } finally {
                channel.close();
            }
        } catch (IOException e) {
            throw new ExportFailedException("Failed to export batch " + batchId, e);
        }
    }
}
