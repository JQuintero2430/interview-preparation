package dev.interview.javalanguage.m06.s08;

import java.io.ByteArrayInputStream;
import java.io.FilterInputStream;
import java.io.IOException;

// Counts the read calls that reach the underlying stream, standing in for system calls on a file.
final class CountingInputStream extends FilterInputStream {

    private int readCalls;

    CountingInputStream(byte[] content) {
        super(new ByteArrayInputStream(content));
    }

    @Override
    public int read() throws IOException {
        readCalls++;
        return super.read();
    }

    @Override
    public int read(byte[] buffer, int offset, int length) throws IOException {
        readCalls++;
        return super.read(buffer, offset, length);
    }

    int readCalls() {
        return readCalls;
    }
}
