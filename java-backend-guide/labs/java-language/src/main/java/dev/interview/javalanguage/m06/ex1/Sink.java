package dev.interview.javalanguage.m06.ex1;

import java.io.IOException;

// The exporter's port to one destination of a batch. close() narrows AutoCloseable's "throws Exception".
public interface Sink extends AutoCloseable {

    void write(String record) throws IOException;

    @Override
    void close() throws IOException;
}
