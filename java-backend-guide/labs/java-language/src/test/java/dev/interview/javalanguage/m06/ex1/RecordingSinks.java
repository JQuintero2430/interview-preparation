package dev.interview.javalanguage.m06.ex1;

import java.io.IOException;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

// A fake SinkFactory that records every open, write and close, and fails where a test tells it to.
final class RecordingSinks implements SinkFactory {

    final List<String> events = new ArrayList<>();

    private final Map<BatchPart, IOException> openFailures = new EnumMap<>(BatchPart.class);
    private final Map<BatchPart, Exception> writeFailures = new EnumMap<>(BatchPart.class);
    private final Map<BatchPart, IOException> closeFailures = new EnumMap<>(BatchPart.class);

    RecordingSinks failOpen(BatchPart part, IOException failure) {
        openFailures.put(part, failure);
        return this;
    }

    // An IOException or a RuntimeException, thrown by the first write to that part.
    RecordingSinks failWrite(BatchPart part, Exception failure) {
        writeFailures.put(part, failure);
        return this;
    }

    RecordingSinks failClose(BatchPart part, IOException failure) {
        closeFailures.put(part, failure);
        return this;
    }

    @Override
    public Sink open(String batchId, BatchPart part) throws IOException {
        String name = name(part);
        IOException failure = openFailures.get(part);
        if (failure != null) {
            events.add("open " + name + " failed");
            throw failure;
        }
        events.add("open " + name);
        return new RecordingSink(name, part);
    }

    private static String name(BatchPart part) {
        return part.name().toLowerCase(java.util.Locale.ROOT);
    }

    private final class RecordingSink implements Sink {

        private final String name;
        private final BatchPart part;

        RecordingSink(String name, BatchPart part) {
            this.name = name;
            this.part = part;
        }

        @Override
        public void write(String record) throws IOException {
            Exception failure = writeFailures.get(part);
            if (failure instanceof IOException io) {
                events.add("write " + name + " failed");
                throw io;
            }
            if (failure instanceof RuntimeException runtime) {
                events.add("write " + name + " rejected");
                throw runtime;
            }
            events.add("write " + name + " " + record);
        }

        @Override
        public void close() throws IOException {
            events.add("close " + name);
            IOException failure = closeFailures.get(part);
            if (failure != null) {
                throw failure;
            }
        }
    }
}
