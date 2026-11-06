package dev.interview.springtransactions.m17.s08;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.springtransactions.m17.support.RecordingTransactionManager;
import java.io.IOException;
import java.lang.reflect.UndeclaredThrowableException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.support.TransactionTemplate;

class TransactionTemplateTest {

    private static final String RESULT = "saved";
    private static final String BEGIN = "begin tx1";
    private static final String COMMIT = "commit tx1";
    private static final String ROLLBACK = "rollback tx1";
    private static final String BOOM = "boom";

    private RecordingTransactionManager manager;
    private TransactionTemplate tx;

    @BeforeEach
    void wire() {
        manager = new RecordingTransactionManager();
        tx = new TransactionTemplate(manager);
    }

    @Test
    @DisplayName("M17 §8 · TransactionTemplate commits when the callback returns")
    void execute_commitsAndReturnsResult_whenCallbackReturns() {
        String result = tx.execute(status -> RESULT);

        assertThat(result).isEqualTo(RESULT);
        assertThat(manager.events()).containsExactly(BEGIN, COMMIT);
    }

    @Test
    @DisplayName("M17 §8 · TransactionTemplate rolls back and rethrows a RuntimeException")
    void execute_rollsBackAndRethrows_whenCallbackThrowsRuntimeException() {
        assertThatThrownBy(() -> tx.executeWithoutResult(status -> {
                    throw new IllegalStateException(BOOM);
                }))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage(BOOM);
        assertThat(manager.events()).containsExactly(BEGIN, ROLLBACK);
    }

    @Test
    @DisplayName("M17 §8 · TransactionTemplate rolls back after setRollbackOnly without an exception")
    void execute_rollsBackSilently_whenCallbackSetsRollbackOnly() {
        String result = tx.execute(status -> {
            status.setRollbackOnly();
            return RESULT;
        });

        assertThat(result).isEqualTo(RESULT);
        assertThat(manager.events()).containsExactly(BEGIN, ROLLBACK);
    }

    @Test
    @DisplayName("M17 §8 · TransactionTemplate wraps a checked exception and rolls back")
    void execute_wrapsInUndeclaredThrowable_whenCallbackThrowsCheckedException() {
        assertThatThrownBy(() -> tx.executeWithoutResult(status -> throwUnchecked(new IOException(BOOM))))
                .isInstanceOf(UndeclaredThrowableException.class)
                .hasCauseInstanceOf(IOException.class);
        assertThat(manager.events()).containsExactly(BEGIN, ROLLBACK);
    }

    // TransactionCallback declares no checked exceptions, but Kotlin callers, Lombok @SneakyThrows and generic
    // rethrows still let one escape; this is the smallest way to reproduce that path from Java.
    @SuppressWarnings("unchecked")
    private static <E extends Throwable> void throwUnchecked(Throwable checked) throws E {
        throw (E) checked;
    }
}
