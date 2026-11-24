package dev.interview.javalanguage.m06.s03;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PaymentExporterTest {

    private static final List<String> ONE_BAD_RECORD = List.of("pay-1;120.00", " ");

    private final FakeChannel channel = new FakeChannel();

    @Test
    @DisplayName("M06 §3 · the exporter writes every record and closes the channel after a good batch")
    void export_writesAndCloses_onSuccess() {
        new PaymentExporter(batchId -> channel).export("b-7", List.of("pay-1;120.00", "pay-2;80.50"));

        assertThat(channel.written).containsExactly("pay-1;120.00", "pay-2;80.50");
        assertThat(channel.closed).isTrue();
    }

    @Test
    @DisplayName("M06 §3 · try-with-resources keeps the validation error and suppresses the close failure")
    void export_keepsBodyException_andSuppressesCloseFailure() {
        channel.failOnClose = true;

        Throwable thrown = catchThrowable(() -> new PaymentExporter(batchId -> channel).export("b-7", ONE_BAD_RECORD));

        assertThat(thrown).isInstanceOf(IllegalArgumentException.class).hasMessage("blank payment record");
        assertThat(thrown.getSuppressed())
                .singleElement()
                .isInstanceOf(IOException.class)
                .hasFieldOrPropertyWithValue("message", "Connection reset");
        assertThat(channel.closed).isTrue();
    }

    @Test
    @DisplayName("M06 §3 · close() in finally replaces the validation error with the close failure")
    void legacyExport_losesBodyException() {
        channel.failOnClose = true;

        Throwable thrown =
                catchThrowable(() -> new LegacyPaymentExporter(batchId -> channel).export("b-7", ONE_BAD_RECORD));

        assertThat(thrown).isInstanceOf(ExportFailedException.class).hasMessage("Failed to export batch b-7");
        assertThat(thrown.getCause()).isInstanceOf(IOException.class).hasMessage("Connection reset");
        assertThat(thrown.getSuppressed()).isEmpty();
        assertThat(thrown.getCause().getSuppressed()).isEmpty();
    }

    @Test
    @DisplayName("M06 §3 · an I/O failure is translated to ExportFailedException with the IOException as its cause")
    void export_translatesIoFailure_keepingTheCause() {
        IOException refused = new IOException("Connection refused");

        Throwable thrown = catchThrowable(() -> new PaymentExporter(batchId -> {
                    throw refused;
                })
                .export("b-7", ONE_BAD_RECORD));

        assertThat(thrown).isInstanceOf(ExportFailedException.class).hasMessage("Failed to export batch b-7");
        assertThat(thrown.getCause()).isSameAs(refused);
    }

    private static final class FakeChannel implements ExportChannel {

        private final List<String> written = new ArrayList<>();
        private boolean failOnClose;
        private boolean closed;

        @Override
        public void write(String record) {
            written.add(record);
        }

        @Override
        public void close() throws IOException {
            closed = true;
            if (failOnClose) {
                throw new IOException("Connection reset");
            }
        }
    }
}
