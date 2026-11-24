package dev.interview.javalanguage.m06.s03;

import java.io.Closeable;
import java.io.IOException;

// A connection to the payment processor's batch endpoint; close() flushes and can fail.
public interface ExportChannel extends Closeable {

    void write(String record) throws IOException;
}
