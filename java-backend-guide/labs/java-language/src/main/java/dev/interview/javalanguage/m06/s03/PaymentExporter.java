package dev.interview.javalanguage.m06.s03;

import java.io.IOException;
import java.util.List;

// try-with-resources closes the channel on every path and keeps the body's exception as the primary one.
public final class PaymentExporter {

    private final ChannelFactory channels;

    public PaymentExporter(ChannelFactory channels) {
        this.channels = channels;
    }

    public void export(String batchId, List<String> records) {
        try (ExportChannel channel = channels.open(batchId)) {
            for (String record : records) {
                channel.write(RecordValidator.validated(record));
            }
        } catch (IOException e) {
            throw new ExportFailedException("Failed to export batch " + batchId, e);
        }
    }
}
