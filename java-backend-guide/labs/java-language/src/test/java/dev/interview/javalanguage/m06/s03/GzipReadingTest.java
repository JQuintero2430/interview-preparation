package dev.interview.javalanguage.m06.s03;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.GZIPOutputStream;
import java.util.zip.ZipException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class GzipReadingTest {

    private static final byte[] NOT_GZIP = "plain text, no GZIP header".getBytes(UTF_8);

    @Test
    @DisplayName(
            "M06 §3 · a stream created inside a resource initializer is not closed when the wrapper's constructor throws")
    void wrapperFailure_leavesInnerStreamOpen() {
        CloseTrackingStream raw = new CloseTrackingStream(NOT_GZIP);

        Throwable thrown = catchThrowable(() -> GzipReading.readAllLeaky(() -> raw));

        assertThat(thrown).isInstanceOf(ZipException.class);
        assertThat(raw.closed).isFalse();
    }

    @Test
    @DisplayName("M06 §3 · declaring each layer as its own resource closes the inner stream when the wrapper fails")
    void separateResources_closeInnerStream_whenWrapperFails() {
        CloseTrackingStream raw = new CloseTrackingStream(NOT_GZIP);

        Throwable thrown = catchThrowable(() -> GzipReading.readAll(() -> raw));

        assertThat(thrown).isInstanceOf(ZipException.class);
        assertThat(raw.closed).isTrue();
    }

    @Test
    @DisplayName("M06 §3 · declaring each layer as its own resource reads valid GZIP data")
    void separateResources_readValidData() throws IOException {
        ByteArrayOutputStream compressed = new ByteArrayOutputStream();
        try (GZIPOutputStream gzip = new GZIPOutputStream(compressed)) {
            gzip.write("statement line".getBytes(UTF_8));
        }
        CloseTrackingStream raw = new CloseTrackingStream(compressed.toByteArray());

        byte[] content = GzipReading.readAll(() -> raw);

        assertThat(new String(content, UTF_8)).isEqualTo("statement line");
        assertThat(raw.closed).isTrue();
    }

    private static final class CloseTrackingStream extends ByteArrayInputStream {

        private boolean closed;

        CloseTrackingStream(byte[] bytes) {
            super(bytes);
        }

        @Override
        public void close() throws IOException {
            closed = true;
            super.close();
        }
    }
}
