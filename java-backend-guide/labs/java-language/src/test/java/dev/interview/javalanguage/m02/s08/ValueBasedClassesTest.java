package dev.interview.javalanguage.m02.s08;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** Module 02 §8: value-based classes are compared by equals, never by identity or by lock. */
class ValueBasedClassesTest {

    private static final String TEXT = "interview";
    private static final String ISO_DATE = "2026-01-23";
    private static final int YEAR = 2026;
    private static final int MONTH = 1;
    private static final int DAY = 23;

    private static final long KEY_VALUE = 1_000L;
    private static final String KEY_TEXT = "1000";
    private static final long OTHER_KEY_VALUE = 2_000L;
    private static final String NULL_KEY_MESSAGE = "key";

    private static final String BIN_DIRECTORY = "bin";
    private static final String JAVA_BINARY = "java";
    private static final String UNLOCK_DIAGNOSTIC = "-XX:+UnlockDiagnosticVMOptions";
    private static final String DIAGNOSE_SYNC = "-XX:DiagnoseSyncOnValueBasedClasses=2";
    private static final String CLASSPATH_FLAG = "-cp";
    private static final long TIMEOUT_SECONDS = 30;
    private static final int EXIT_OK = 0;
    private static final String LOG_TAG = "[valuebasedclasses]";
    private static final String LOG_SYNC = "Synchronizing on object";
    private static final String LOG_KLASS = "of klass java.lang.Integer";
    private static final String LOCKED_OUTPUT = "locked 42";

    @Test
    @DisplayName("M02 §8 · two equal Optionals are equal but identity is not specified")
    void optional_isEqual_whenWrappingEqualValues() {
        Optional<String> first = Optional.of(new String(TEXT));
        Optional<String> second = Optional.of(new String(TEXT));

        assertThat(first).isEqualTo(second);
        assertThat(first).hasSameHashCodeAs(second);
    }

    @Test
    @DisplayName("M02 §8 · equal LocalDates are interchangeable through equals")
    void localDate_isEqual_whenSameDayCreatedTwoWays() {
        LocalDate fromFields = LocalDate.of(YEAR, MONTH, DAY);
        LocalDate parsed = LocalDate.parse(ISO_DATE);

        assertThat(fromFields).isEqualTo(parsed);
        assertThat(fromFields).hasSameHashCodeAs(parsed);
        assertThat(fromFields.compareTo(parsed)).isZero();
    }

    @Test
    @DisplayName("M02 §8 · KeyedLocks returns the same lock for equal keys")
    void lockFor_returnsSameLock_whenKeysAreEqual() {
        KeyedLocks<Long> locks = new KeyedLocks<>();

        Object first = locks.lockFor(Long.valueOf(KEY_VALUE));
        Object second = locks.lockFor(Long.parseLong(KEY_TEXT));

        assertThat(first).isSameAs(second);
    }

    @Test
    @DisplayName("M02 §8 · KeyedLocks returns distinct locks for different keys")
    void lockFor_returnsDistinctLocks_whenKeysDiffer() {
        KeyedLocks<Long> locks = new KeyedLocks<>();

        Object first = locks.lockFor(KEY_VALUE);
        Object second = locks.lockFor(OTHER_KEY_VALUE);

        assertThat(first).isNotSameAs(second);
    }

    @Test
    @DisplayName("M02 §8 · KeyedLocks rejects a null key")
    void lockFor_throwsNullPointerException_whenKeyIsNull() {
        KeyedLocks<Long> locks = new KeyedLocks<>();

        assertThatThrownBy(() -> locks.lockFor(null))
                .isInstanceOf(NullPointerException.class)
                .hasMessage(NULL_KEY_MESSAGE);
    }

    @Test
    @DisplayName("M02 §8 · HotSpot logs synchronization on an Integer held as Object")
    void main_logsValueBasedSynchronization_whenRunWithDiagnosticFlag() throws Exception {
        Path java = Path.of(System.getProperty("java.home"), BIN_DIRECTORY, JAVA_BINARY);
        Path classes = Path.of(SyncOnBoxedValue.class
                .getProtectionDomain()
                .getCodeSource()
                .getLocation()
                .toURI());
        Process process = new ProcessBuilder(
                        java.toString(),
                        UNLOCK_DIAGNOSTIC,
                        DIAGNOSE_SYNC,
                        CLASSPATH_FLAG,
                        classes.toString(),
                        SyncOnBoxedValue.class.getName())
                .redirectErrorStream(true)
                .start();

        String output = readAll(process);
        boolean finished = process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);

        assertThat(finished).isTrue();
        assertThat(process.exitValue()).isEqualTo(EXIT_OK);
        assertThat(output).contains(LOG_TAG, LOG_SYNC, LOG_KLASS, LOCKED_OUTPUT);
    }

    private static String readAll(Process process) throws IOException {
        return new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
    }
}
