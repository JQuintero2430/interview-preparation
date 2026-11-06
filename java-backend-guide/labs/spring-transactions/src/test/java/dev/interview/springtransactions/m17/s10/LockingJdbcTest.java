package dev.interview.springtransactions.m17.s10;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.springtransactions.m17.support.PostgresTestBase;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class LockingJdbcTest extends PostgresTestBase {

    private static final String DEADLOCK_DETECTED = "40P01";
    private static final String LOCK_NOT_AVAILABLE = "55P03";
    private static final String COMMITTED = "committed";
    private static final String CREATE_STOCK = "create table if not exists stock"
            + " (id bigint primary key, quantity int not null, version bigint not null default 0)";
    private static final String TRUNCATE_STOCK = "truncate stock";
    private static final String SEED_STOCK = "insert into stock (id, quantity) values (1, 10), (2, 10)";
    private static final String READ_QUANTITY = "select quantity from stock where id = 1";
    private static final String LOCK_ROW_1 = "select quantity from stock where id = 1 for update";
    private static final String LOCK_ROW_2 = "select quantity from stock where id = 2 for update";
    private static final String WRITE_QUANTITY = "update stock set quantity = %d where id = 1";
    private static final String SHORT_LOCK_TIMEOUT = "set lock_timeout = '100ms'";
    private static final String SHOW_DEADLOCK_TIMEOUT = "show deadlock_timeout";
    private static final String ONE_SECOND = "1s";
    private static final Duration DEADLOCK_TIMEOUT_LOWER_BOUND = Duration.ofMillis(900);
    private static final Duration UPPER_BOUND = Duration.ofSeconds(10);

    @BeforeAll
    static void createStockTable() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(CREATE_STOCK);
        }
    }

    @BeforeEach
    void seed() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(TRUNCATE_STOCK);
            statement.execute(SEED_STOCK);
        }
    }

    @Test
    @DisplayName("M17 §10 · read-modify-write at read committed loses an update")
    void secondWrite_overwritesFirst_whenBothReadBeforeWriting() throws SQLException {
        try (Connection first = begin();
                Connection second = begin()) {
            int firstRead = queryInt(first, READ_QUANTITY);
            int secondRead = queryInt(second, READ_QUANTITY);

            execute(first, WRITE_QUANTITY.formatted(firstRead - 1));
            first.commit();
            execute(second, WRITE_QUANTITY.formatted(secondRead - 1));
            second.commit();
        }

        assertThat(currentQuantity()).isEqualTo(9);
    }

    @Test
    @DisplayName("M17 §10 · FOR UPDATE serialises the second writer")
    void secondWriter_readsFirstWritersValue_whenBothLockForUpdate() throws Exception {
        try (Connection first = begin();
                Connection second = begin();
                ExecutorService secondThread = Executors.newSingleThreadExecutor()) {
            int firstRead = queryInt(first, LOCK_ROW_1);
            Future<Integer> secondRead = secondThread.submit(() -> queryInt(second, LOCK_ROW_1));

            execute(first, WRITE_QUANTITY.formatted(firstRead - 1));
            first.commit();
            int secondValue = secondRead.get(UPPER_BOUND.toSeconds(), TimeUnit.SECONDS);
            execute(second, WRITE_QUANTITY.formatted(secondValue - 1));
            second.commit();

            assertThat(secondValue).isEqualTo(9);
        }

        assertThat(currentQuantity()).isEqualTo(8);
    }

    @Test
    @DisplayName("M17 §10 · lock_timeout turns the wait into 55P03")
    void lockRequest_failsWith55P03_whenLockTimeoutExpires() throws SQLException {
        try (Connection holder = begin();
                Connection waiter = begin()) {
            queryInt(holder, LOCK_ROW_1);
            execute(waiter, SHORT_LOCK_TIMEOUT);

            assertThatThrownBy(() -> queryInt(waiter, LOCK_ROW_1))
                    .isInstanceOf(SQLException.class)
                    .extracting(error -> ((SQLException) error).getSQLState())
                    .isEqualTo(LOCK_NOT_AVAILABLE);
        }
    }

    @Test
    @DisplayName("M17 §10 · opposite lock order: one transaction fails with 40P01")
    void oneTransaction_failsWith40P01_whenLocksTakenInOppositeOrder() throws Exception {
        long start = System.nanoTime();
        List<String> outcomes;
        try (Connection first = begin();
                Connection second = begin();
                ExecutorService both = Executors.newFixedThreadPool(2)) {
            queryInt(first, LOCK_ROW_1);
            queryInt(second, LOCK_ROW_2);

            Future<String> firstOutcome = both.submit(() -> lockThenCommit(first, LOCK_ROW_2));
            Future<String> secondOutcome = both.submit(() -> lockThenCommit(second, LOCK_ROW_1));
            outcomes = List.of(
                    firstOutcome.get(UPPER_BOUND.toSeconds(), TimeUnit.SECONDS),
                    secondOutcome.get(UPPER_BOUND.toSeconds(), TimeUnit.SECONDS));
        }
        Duration elapsed = Duration.ofNanos(System.nanoTime() - start);

        assertThat(outcomes).containsExactlyInAnyOrder(DEADLOCK_DETECTED, COMMITTED);
        assertThat(elapsed).isBetween(DEADLOCK_TIMEOUT_LOWER_BOUND, UPPER_BOUND);
    }

    @Test
    @DisplayName("M17 §10 · deadlock_timeout defaults to 1s")
    void deadlockTimeout_isOneSecond_whenNotConfigured() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement();
                ResultSet rows = statement.executeQuery(SHOW_DEADLOCK_TIMEOUT)) {
            rows.next();

            assertThat(rows.getString(1)).isEqualTo(ONE_SECOND);
        }
    }

    // PostgreSQL picks the deadlock victim, so each side records its own outcome instead of assuming which one fails.
    private static String lockThenCommit(Connection connection, String lockStatement) throws SQLException {
        try {
            queryInt(connection, lockStatement);
            connection.commit();
            return COMMITTED;
        } catch (SQLException error) {
            connection.rollback();
            return error.getSQLState();
        }
    }

    private static Connection begin() throws SQLException {
        Connection connection = openConnection();
        connection.setAutoCommit(false);
        return connection;
    }

    private static int queryInt(Connection connection, String sql) throws SQLException {
        try (Statement statement = connection.createStatement();
                ResultSet rows = statement.executeQuery(sql)) {
            rows.next();
            return rows.getInt(1);
        }
    }

    private static void execute(Connection connection, String sql) throws SQLException {
        try (Statement statement = connection.createStatement()) {
            statement.execute(sql);
        }
    }

    private static int currentQuantity() throws SQLException {
        try (Connection connection = openConnection()) {
            return queryInt(connection, READ_QUANTITY);
        }
    }
}
