package dev.interview.springtransactions.m17.s02;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.interview.springtransactions.m17.support.RecordingTransactionManager;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.concurrent.CompletableFuture;
import javax.sql.DataSource;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DataSourceUtils;
import org.springframework.transaction.IllegalTransactionStateException;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionSynchronizationManager;

class TransactionAbstractionTest {

    private final RecordingTransactionManager transactionManager = new RecordingTransactionManager();
    private final ManualTransactionRunner runner = new ManualTransactionRunner(transactionManager);

    @Test
    @DisplayName("M17 §2 · getTransaction/commit sequence")
    void getTransactionThenCommit() {
        TransactionStatus status = transactionManager.getTransaction(TransactionDefinition.withDefaults());

        assertThat(status.isNewTransaction()).isTrue();
        assertThat(TransactionSynchronizationManager.isActualTransactionActive())
                .isTrue();

        transactionManager.commit(status);

        assertThat(transactionManager.events()).containsExactly("begin tx1", "commit tx1");
        assertThat(TransactionSynchronizationManager.isActualTransactionActive())
                .isFalse();
        assertThat(TransactionSynchronizationManager.getResourceMap()).isEmpty();
    }

    @Test
    @DisplayName("M17 §2 · a runtime exception from the work rolls back")
    void exceptionRollsBack() {
        assertThatThrownBy(() -> runner.inTransaction(TransactionDefinition.withDefaults(), () -> {
                    throw new IllegalStateException("payment declined");
                }))
                .isInstanceOf(IllegalStateException.class);

        assertThat(transactionManager.events()).containsExactly("begin tx1", "rollback tx1");
    }

    @Test
    @DisplayName("M17 §2 · commit or rollback twice is rejected")
    void completedStatusIsRejected() {
        TransactionStatus status = transactionManager.getTransaction(TransactionDefinition.withDefaults());
        transactionManager.commit(status);

        assertThatThrownBy(() -> transactionManager.rollback(status))
                .isInstanceOf(IllegalTransactionStateException.class)
                .hasMessageContaining("already completed");
    }

    @Test
    @DisplayName("M17 §2 · the transaction is bound to the calling thread only")
    void transactionIsThreadBound() {
        Boolean activeOnOtherThread = runner.inTransaction(
                TransactionDefinition.withDefaults(),
                () -> CompletableFuture.supplyAsync(TransactionSynchronizationManager::isActualTransactionActive)
                        .join());

        assertThat(activeOnOtherThread).isFalse();
    }

    @Test
    @DisplayName("M17 §2 · DataSourceUtils returns the transaction's connection, a raw getConnection does not")
    void onlyDataSourceUtilsSeesTheBoundConnection() throws SQLException {
        Connection transactional = mock(Connection.class);
        Connection raw = mock(Connection.class);
        when(transactional.getAutoCommit()).thenReturn(true);
        DataSource dataSource = mock(DataSource.class);
        when(dataSource.getConnection()).thenReturn(transactional, raw);
        ManualTransactionRunner jdbcRunner = new ManualTransactionRunner(new DataSourceTransactionManager(dataSource));

        Connection[] seen = jdbcRunner.inTransaction(TransactionDefinition.withDefaults(), () ->
                new Connection[] {DataSourceUtils.getConnection(dataSource), getRaw(dataSource)});

        assertThat(seen[0]).isSameAs(transactional);
        assertThat(seen[1]).isSameAs(raw);
        InOrder order = inOrder(transactional);
        order.verify(transactional).setAutoCommit(false);
        order.verify(transactional).commit();
        order.verify(transactional).setAutoCommit(true);
        order.verify(transactional).close();
        verify(raw, never()).commit();
        verify(raw, never()).setAutoCommit(false);
    }

    private static Connection getRaw(DataSource dataSource) {
        try {
            return dataSource.getConnection();
        } catch (SQLException ex) {
            throw new IllegalStateException(ex);
        }
    }
}
