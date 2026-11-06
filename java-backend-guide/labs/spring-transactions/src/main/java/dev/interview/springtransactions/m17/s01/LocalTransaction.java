package dev.interview.springtransactions.m17.s01;

import java.sql.Connection;
import java.sql.SQLException;

/** A local transaction on one JDBC connection: the begin/commit/rollback template, without Spring. */
public final class LocalTransaction {

    @FunctionalInterface
    public interface SqlWork {
        void run(Connection connection) throws SQLException;
    }

    private LocalTransaction() {}

    public static void inTransaction(Connection connection, SqlWork work) throws SQLException {
        boolean previousAutoCommit = connection.getAutoCommit();
        connection.setAutoCommit(false);
        try {
            work.run(connection);
            connection.commit();
        } catch (SQLException | RuntimeException | Error ex) {
            // Error too: restoring auto-commit on an open transaction would commit it.
            rollbackKeeping(connection, previousAutoCommit, ex);
            throw ex;
        }
        connection.setAutoCommit(previousAutoCommit);
    }

    private static void rollbackKeeping(Connection connection, boolean previousAutoCommit, Throwable original) {
        try {
            connection.rollback();
            connection.setAutoCommit(previousAutoCommit);
        } catch (SQLException cleanupFailure) {
            original.addSuppressed(cleanupFailure);
        }
    }
}
