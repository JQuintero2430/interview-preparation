package dev.interview.javalanguage.m06.ex1;

import static dev.interview.javalanguage.m06.ex1.BatchPart.DATA;
import static dev.interview.javalanguage.m06.ex1.BatchPart.MANIFEST;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.io.IOException;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ExporterTest {

    private static final List<String> GOOD = List.of("pay-1;120.00", "pay-2;80.50");

    private final RecordingSinks sinks = new RecordingSinks();
    private final Exporter exporter = new Exporter(sinks);

    @Test
    @DisplayName("Ex06.1 · (1) on success both sinks are closed, the manifest (opened last) first")
    void success_closesInReverseOrder() {
        int written = exporter.export("b-7", GOOD);

        assertThat(written).isEqualTo(2);
        assertThat(sinks.events)
                .containsExactly(
                        "open data",
                        "open manifest",
                        "write data pay-1;120.00",
                        "write data pay-2;80.50",
                        "write manifest records=2",
                        "close manifest",
                        "close data");
    }

    @Test
    @DisplayName("Ex06.1 · (1) on a write failure both sinks are still closed, in reverse order of opening")
    void failure_closesInReverseOrder() {
        sinks.failWrite(DATA, new IOException("disk full"));

        catchThrowable(() -> exporter.export("b-7", GOOD));

        assertThat(sinks.events)
                .containsExactly("open data", "open manifest", "write data failed", "close manifest", "close data");
    }

    @Test
    @DisplayName("Ex06.1 · (2) a write failure stays the cause, and both close failures are suppressed on it")
    void writeFailure_keepsCloseFailuresSuppressed() {
        IOException diskFull = new IOException("disk full");
        IOException manifestClose = new IOException("manifest close failed");
        IOException dataClose = new IOException("data close failed");
        sinks.failWrite(DATA, diskFull).failClose(MANIFEST, manifestClose).failClose(DATA, dataClose);

        Throwable thrown = catchThrowable(() -> exporter.export("b-7", GOOD));

        assertThat(thrown).isInstanceOf(ExportFailedException.class);
        assertThat(thrown.getCause()).isSameAs(diskFull);
        assertThat(diskFull.getSuppressed()).containsExactly(manifestClose, dataClose);
        assertThat(thrown.getSuppressed()).isEmpty();
    }

    @Test
    @DisplayName("Ex06.1 · (3) an I/O failure becomes one unchecked ExportFailedException naming the batch, cause kept")
    void openFailure_isTranslated() {
        IOException refused = new IOException("Connection refused");
        sinks.failOpen(DATA, refused);

        Throwable thrown = catchThrowable(() -> exporter.export("b-7", GOOD));

        assertThat(thrown)
                .isInstanceOf(RuntimeException.class)
                .isExactlyInstanceOf(ExportFailedException.class)
                .hasMessage("Failed to export batch b-7");
        assertThat(((ExportFailedException) thrown).batchId()).isEqualTo("b-7");
        assertThat(thrown.getCause()).isSameAs(refused);
        assertThat(sinks.events).containsExactly("open data failed");
    }

    @Test
    @DisplayName("Ex06.1 · (3) close failures after a good body are translated too: the first one closed is the cause")
    void closeFailuresOnly_areTranslated() {
        IOException manifestClose = new IOException("manifest close failed");
        IOException dataClose = new IOException("data close failed");
        sinks.failClose(MANIFEST, manifestClose).failClose(DATA, dataClose);

        Throwable thrown = catchThrowable(() -> exporter.export("b-7", GOOD));

        assertThat(thrown).isInstanceOf(ExportFailedException.class);
        assertThat(thrown.getCause()).isSameAs(manifestClose);
        assertThat(manifestClose.getSuppressed()).containsExactly(dataClose);
    }

    @Test
    @DisplayName("Ex06.1 · (4) a failure opening the second sink still closes the first, and nothing is written")
    void secondOpenFails_closesFirst() {
        IOException noSpace = new IOException("no space for manifest");
        sinks.failOpen(MANIFEST, noSpace);

        Throwable thrown = catchThrowable(() -> exporter.export("b-7", GOOD));

        assertThat(sinks.events).containsExactly("open data", "open manifest failed", "close data");
        assertThat(thrown).isInstanceOf(ExportFailedException.class);
        assertThat(thrown.getCause()).isSameAs(noSpace);
        assertThat(noSpace.getSuppressed()).isEmpty();
    }

    @Test
    @DisplayName(
            "Ex06.1 · (5) a blank record's IllegalArgumentException passes through untranslated, close failure suppressed")
    void blankRecord_passesThrough() {
        IOException dataClose = new IOException("data close failed");
        sinks.failClose(DATA, dataClose);

        Throwable thrown = catchThrowable(() -> exporter.export("b-7", List.of("pay-1;120.00", " ")));

        assertThat(thrown).isExactlyInstanceOf(IllegalArgumentException.class).hasMessage("blank export record");
        assertThat(thrown.getSuppressed()).containsExactly(dataClose);
        assertThat(sinks.events).endsWith("close manifest", "close data");
    }

    @Test
    @DisplayName("Ex06.1 · (5) a sink's own IllegalArgumentException reaches the caller as the same object")
    void sinkRejection_isTheSameObject() {
        IllegalArgumentException rejected = new IllegalArgumentException("record too long");
        sinks.failWrite(DATA, rejected);

        Throwable thrown = catchThrowable(() -> exporter.export("b-7", GOOD));

        assertThat(thrown).isSameAs(rejected);
        assertThat(thrown.getCause()).isNull();
    }
}
