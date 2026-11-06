package dev.interview.springtransactions.m17.s01;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.springtransactions.m17.support.PostgresTestBase;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Proxy;
import java.sql.Connection;
import java.sql.SQLException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class LocalTransactionTest extends PostgresTestBase {

    private static final String COUNT_ORDERS = "select count(*) from orders";
    private static final String COUNT_LINES = "select count(*) from order_line";
    private static final String CHECK_VIOLATION = "23514";
    private static final String IN_FAILED_SQL_TRANSACTION = "25P02";

    @BeforeEach
    void cleanTables() throws SQLException {
        truncateAll();
    }

    @Test
    @DisplayName("M17 §1 · a new JDBC connection starts in auto-commit mode")
    void newConnectionIsAutoCommit() throws SQLException {
        try (Connection connection = openConnection()) {
            assertThat(connection.getAutoCommit()).isTrue();
        }
    }

    @Test
    @DisplayName("M17 §1 · auto-commit commits each statement")
    void autoCommitCommitsEachStatement() throws SQLException {
        try (Connection connection = openConnection()) {
            assertThatThrownBy(() -> OrderStatements.placeOrder(connection, 1, "ana", "SKU-1", 0))
                    .isInstanceOfSatisfying(
                            SQLException.class,
                            ex -> assertThat(ex.getSQLState()).isEqualTo(CHECK_VIOLATION));
        }
        assertCounts(1, 0);
    }

    @Test
    @DisplayName("M17 §1 · rollback undoes both inserts")
    void rollbackUndoesBothInserts() throws SQLException {
        try (Connection connection = openConnection()) {
            assertThatThrownBy(() -> LocalTransaction.inTransaction(
                            connection, c -> OrderStatements.placeOrder(c, 1, "ana", "SKU-1", 0)))
                    .isInstanceOfSatisfying(
                            SQLException.class,
                            ex -> assertThat(ex.getSQLState()).isEqualTo(CHECK_VIOLATION));
            assertThat(connection.getAutoCommit()).isTrue();
        }
        assertCounts(0, 0);
    }

    @Test
    @DisplayName("M17 §1 · commit makes both rows visible together")
    void commitMakesBothRowsVisible() throws SQLException {
        try (Connection connection = openConnection()) {
            LocalTransaction.inTransaction(connection, c -> OrderStatements.placeOrder(c, 1, "ana", "SKU-1", 2));
        }
        assertCounts(1, 1);
    }

    @Test
    @DisplayName("M17 §1 · uncommitted rows are invisible to other connections")
    void uncommittedRowsAreInvisible() throws SQLException {
        try (Connection writer = openConnection();
                Connection reader = openConnection()) {
            writer.setAutoCommit(false);
            OrderStatements.insertOrder(writer, 1, "ana");
            assertThat(countRows(reader, COUNT_ORDERS)).isZero();

            writer.commit();

            assertThat(countRows(reader, COUNT_ORDERS)).isEqualTo(1);
        }
    }

    @Test
    @DisplayName("M17 §1 · PostgreSQL aborts the transaction after a failed statement")
    void failedStatementAbortsTransaction() throws SQLException {
        try (Connection connection = openConnection()) {
            connection.setAutoCommit(false);
            OrderStatements.insertOrder(connection, 1, "ana");
            assertThatThrownBy(() -> OrderStatements.insertLine(connection, 1, "SKU-1", 0))
                    .isInstanceOfSatisfying(
                            SQLException.class,
                            ex -> assertThat(ex.getSQLState()).isEqualTo(CHECK_VIOLATION));

            assertThatThrownBy(() -> OrderStatements.insertOrder(connection, 2, "bo"))
                    .isInstanceOfSatisfying(
                            SQLException.class,
                            ex -> assertThat(ex.getSQLState()).isEqualTo(IN_FAILED_SQL_TRANSACTION));
            connection.rollback();
        }
        assertCounts(0, 0);
    }

    @Test
    @DisplayName("M17 §1 · a runtime exception from the work is rolled back and rethrown")
    void runtimeExceptionIsRolledBackAndRethrown() throws SQLException {
        IllegalStateException failure = new IllegalStateException("payment declined");
        try (Connection connection = openConnection()) {
            assertThatThrownBy(() -> LocalTransaction.inTransaction(connection, c -> {
                        OrderStatements.insertOrder(c, 1, "ana");
                        throw failure;
                    }))
                    .isSameAs(failure);
        }
        assertCounts(0, 0);
    }

    @Test
    @DisplayName("M17 §1 · an Error from the work is rolled back, not committed by the auto-commit restore")
    void errorIsRolledBack() throws SQLException {
        AssertionError failure = new AssertionError("invariant broken");
        try (Connection connection = openConnection()) {
            assertThatThrownBy(() -> LocalTransaction.inTransaction(connection, c -> {
                        OrderStatements.insertOrder(c, 1, "ana");
                        throw failure;
                    }))
                    .isSameAs(failure);
        }
        assertCounts(0, 0);
    }

    @Test
    @DisplayName("M17 §1 · a failing rollback is kept as a suppressed exception")
    void failingRollbackIsSuppressed() throws SQLException {
        SQLException rollbackFailure = new SQLException("connection lost");
        IllegalStateException failure = new IllegalStateException("payment declined");
        try (Connection real = openConnection()) {
            Connection rollbackFails = failingRollback(real, rollbackFailure);

            assertThatThrownBy(() -> LocalTransaction.inTransaction(rollbackFails, c -> {
                        throw failure;
                    }))
                    .isSameAs(failure)
                    .satisfies(ex -> assertThat(ex.getSuppressed()).containsExactly(rollbackFailure));
            assertThat(real.getAutoCommit()).isFalse();
        }
    }

    @Test
    @DisplayName("M17 §1 · the previous auto-commit mode is restored")
    void previousAutoCommitModeIsRestored() throws SQLException {
        try (Connection connection = openConnection()) {
            connection.setAutoCommit(false);

            LocalTransaction.inTransaction(connection, c -> OrderStatements.insertOrder(c, 1, "ana"));

            assertThat(connection.getAutoCommit()).isFalse();
            connection.rollback();
        }
        assertCounts(1, 0);
    }

    @Test
    @DisplayName("M17 §1 · rollback is rejected in auto-commit mode")
    void rollbackIsRejectedInAutoCommitMode() throws SQLException {
        try (Connection connection = openConnection()) {
            OrderStatements.insertOrder(connection, 1, "ana");

            assertThatThrownBy(connection::rollback)
                    .isInstanceOf(SQLException.class)
                    .hasMessageContaining("autoCommit");
        }
        assertCounts(1, 0);
    }

    private static void assertCounts(long orders, long lines) throws SQLException {
        try (Connection reader = openConnection()) {
            assertThat(countRows(reader, COUNT_ORDERS)).isEqualTo(orders);
            assertThat(countRows(reader, COUNT_LINES)).isEqualTo(lines);
        }
    }

    /** A real connection whose rollback() fails, to observe how the template reports it. */
    private static Connection failingRollback(Connection real, SQLException rollbackFailure) {
        return (Connection) Proxy.newProxyInstance(
                Connection.class.getClassLoader(), new Class<?>[] {Connection.class}, (proxy, method, args) -> {
                    if (method.getName().equals("rollback") && method.getParameterCount() == 0) {
                        throw rollbackFailure;
                    }
                    try {
                        return method.invoke(real, args);
                    } catch (InvocationTargetException ex) {
                        throw ex.getCause();
                    }
                });
    }
}
