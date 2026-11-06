package dev.interview.springtransactions.m17.s08;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.catchThrowable;

import com.zaxxer.hikari.HikariDataSource;
import dev.interview.springtransactions.m17.support.PostgresTestBase;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.Duration;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.QueryTimeoutException;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.TransactionTimedOutException;
import org.springframework.transaction.support.TransactionTemplate;

class ReadOnlyAndTimeoutJdbcTest extends PostgresTestBase {

    private static final int POOL_SIZE = 2;
    private static final int ONE_SECOND = 1;
    private static final long PAST_DEADLINE_MS = 1_200;
    private static final Duration TIMEOUT_LOWER_BOUND = Duration.ofMillis(900);
    private static final Duration TIMEOUT_UPPER_BOUND = Duration.ofMillis(4_500);
    private static final String CREATE_NOTE = "create table if not exists note (id bigint primary key)";
    private static final String TRUNCATE_NOTE = "truncate note";
    private static final String INSERT_NOTE = "insert into note values (1)";
    private static final String COUNT_NOTES = "select count(*) from note";
    private static final String SHOW_READ_ONLY = "show transaction_read_only";
    private static final String SLEEP_FIVE_SECONDS = "select pg_sleep(5)";
    private static final String ON = "on";
    private static final String READ_ONLY_TRANSACTION = "25006";
    private static final String QUERY_CANCELED = "57014";

    private HikariDataSource dataSource;
    private JdbcClient jdbc;
    private TransactionTemplate tx;

    @BeforeAll
    static void createNoteTable() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(CREATE_NOTE);
        }
    }

    @BeforeEach
    void truncateAndWire() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(TRUNCATE_NOTE);
        }
        dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(POSTGRES.getJdbcUrl());
        dataSource.setUsername(POSTGRES.getUsername());
        dataSource.setPassword(POSTGRES.getPassword());
        dataSource.setMaximumPoolSize(POOL_SIZE);
        jdbc = JdbcClient.create(dataSource);
        tx = new TransactionTemplate(new DataSourceTransactionManager(dataSource));
    }

    @AfterEach
    void closePool() {
        dataSource.close();
    }

    @Test
    @DisplayName("M17 §8 · readOnly reaches PostgreSQL as a read-only transaction")
    void readOnly_startsReadOnlyTransaction_whenFlagSet() {
        tx.setReadOnly(true);

        String readOnly = tx.execute(
                status -> jdbc.sql(SHOW_READ_ONLY).query(String.class).single());

        assertThat(readOnly).isEqualTo(ON);
    }

    @Test
    @DisplayName("M17 §8 · readOnly makes PostgreSQL reject a write (SQLSTATE 25006)")
    void readOnly_rejectsWrite_whenStatementWrites() throws SQLException {
        tx.setReadOnly(true);

        assertThatThrownBy(() ->
                        tx.executeWithoutResult(status -> jdbc.sql(INSERT_NOTE).update()))
                .isInstanceOf(DataAccessException.class)
                .rootCause()
                .isInstanceOf(SQLException.class)
                .satisfies(cause ->
                        assertThat(((SQLException) cause).getSQLState()).isEqualTo(READ_ONLY_TRANSACTION));
        assertThat(countNotes()).isZero();
    }

    @Test
    @DisplayName("M17 §8 · timeout aborts a long statement")
    void timeout_abortsStatement_whenStatementOutlivesDeadline() {
        tx.setTimeout(ONE_SECOND);
        long start = System.nanoTime();

        Throwable thrown = catchThrowable(() -> tx.executeWithoutResult(
                status -> jdbc.sql(SLEEP_FIVE_SECONDS).query().singleValue()));

        Duration elapsed = Duration.ofNanos(System.nanoTime() - start);
        assertThat(thrown)
                .isInstanceOf(QueryTimeoutException.class)
                .rootCause()
                .isInstanceOf(SQLException.class)
                .satisfies(cause ->
                        assertThat(((SQLException) cause).getSQLState()).isEqualTo(QUERY_CANCELED));
        assertThat(elapsed).isBetween(TIMEOUT_LOWER_BOUND, TIMEOUT_UPPER_BOUND);
    }

    @Test
    @DisplayName("M17 §8 · timeout is checked when the next statement starts")
    void timeout_failsNextStatement_whenCodeOutlivesDeadline() throws SQLException {
        tx.setTimeout(ONE_SECOND);

        assertThatThrownBy(() -> tx.executeWithoutResult(status -> {
                    jdbc.sql(INSERT_NOTE).update();
                    pastDeadline();
                    jdbc.sql(COUNT_NOTES).query(Long.class).single();
                }))
                .isInstanceOf(TransactionTimedOutException.class);
        assertThat(countNotes()).isZero();
    }

    @Test
    @DisplayName("M17 §8 · timeout does not bound code after the last statement")
    void timeout_stillCommits_whenDeadlinePassesAfterLastStatement() throws SQLException {
        tx.setTimeout(ONE_SECOND);

        tx.executeWithoutResult(status -> {
            jdbc.sql(INSERT_NOTE).update();
            pastDeadline();
        });

        assertThat(countNotes()).isEqualTo(1);
    }

    // Sleeping is the subject here, not coordination: the test needs wall-clock time to pass the deadline
    // without any statement running, which is what a slow remote call inside a transaction looks like.
    private static void pastDeadline() {
        try {
            Thread.sleep(PAST_DEADLINE_MS);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(ex);
        }
    }

    private static long countNotes() throws SQLException {
        try (Connection connection = openConnection()) {
            return countRows(connection, COUNT_NOTES);
        }
    }
}
