package dev.interview.javalanguage.m06.s03;

import java.io.IOException;
import java.io.InputStream;
import java.util.zip.GZIPInputStream;

// Only a declared variable is a resource: a stream created inside an initializer is not closed if the wrapper fails.
public final class GzipReading {

    private GzipReading() {}

    public static byte[] readAllLeaky(StreamOpener opener) throws IOException {
        try (InputStream in = new GZIPInputStream(opener.open())) {
            return in.readAllBytes();
        }
    }

    public static byte[] readAll(StreamOpener opener) throws IOException {
        try (InputStream raw = opener.open();
                InputStream in = new GZIPInputStream(raw)) {
            return in.readAllBytes();
        }
    }
}
