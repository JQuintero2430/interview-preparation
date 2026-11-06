package dev.interview.springtransactions.m17.s13;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import dev.interview.springtransactions.m17.support.PostgresTestBase;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

class DuplicateRetryTest extends PostgresTestBase {

    private static final String CLIENT_A = "client-a";
    private static final String CLIENT_B = "client-b";
    private static final String KEY = "7f3c2a90-request-1";
    private static final long ORDER_ID = 42;
    private static final long WAIT_SECONDS = 10;
    private static final String UNIQUE_VIOLATION = "23505";
    private static final String CREATE_UNKEYED = "create table if not exists order_request_unkeyed"
            + " (client_id text not null, idempotency_key text not null, order_id bigint not null)";
    private static final String CREATE_KEYED = "create table if not exists order_request"
            + " (client_id text not null, idempotency_key text not null, order_id bigint not null,"
            + " primary key (client_id, idempotency_key))";
    private static final String TRUNCATE = "truncate order_request_unkeyed, order_request";
    private static final String INSERT_UNKEYED =
            "insert into order_request_unkeyed (client_id, idempotency_key, order_id) values (?, ?, ?)";
    private static final String COUNT_UNKEYED = "select count(*) from order_request_unkeyed";
    private static final String COUNT_KEYED = "select count(*) from order_request";

    private OrderRequests requests;
    private ExecutorService callers;

    @BeforeAll
    static void createTables() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(CREATE_UNKEYED);
            statement.execute(CREATE_KEYED);
        }
    }

    @BeforeEach
    void truncateAndWire() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(TRUNCATE);
        }
        requests = new OrderRequests(JdbcClient.create(
                new DriverManagerDataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())));
        callers = Executors.newFixedThreadPool(2);
    }

    @AfterEach
    void stopCallers() {
        callers.shutdownNow();
    }

    @Test
    @DisplayName("M17 §13 · retry without a constraint inserts a second order")
    void retry_insertsSecondRow_whenNoUniqueConstraint() throws SQLException {
        try (Connection connection = openConnection();
                PreparedStatement insert = connection.prepareStatement(INSERT_UNKEYED)) {
            insert.setString(1, CLIENT_A);
            insert.setString(2, KEY);
            insert.setLong(3, ORDER_ID);
            insert.executeUpdate();
            insert.executeUpdate(); // the client's retry after a lost response

            assertThat(countRows(connection, COUNT_UNKEYED)).isEqualTo(2);
        }
    }

    @Test
    @DisplayName("M17 §13 · unique constraint turns duplicate retry into a constraint violation")
    void retry_failsWith23505_whenKeyAlreadyStored() throws SQLException {
        requests.insert(CLIENT_A, KEY, ORDER_ID);

        Throwable retry = catchThrowable(() -> requests.insert(CLIENT_A, KEY, ORDER_ID));

        assertThat(retry).isInstanceOf(DuplicateKeyException.class);
        assertThat(((SQLException) retry.getCause()).getSQLState()).isEqualTo(UNIQUE_VIOLATION);
        assertThat(keyedCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("M17 §13 · ON CONFLICT DO NOTHING makes the retry a no-op")
    void place_returnsFalse_whenSameClientRetriesSameKey() throws SQLException {
        assertThat(requests.place(CLIENT_A, KEY, ORDER_ID)).isTrue();
        assertThat(requests.place(CLIENT_A, KEY, ORDER_ID)).isFalse();

        assertThat(keyedCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("M17 §13 · idempotency keys are scoped per client")
    void place_acceptsSameKey_whenClientsDiffer() throws SQLException {
        assertThat(requests.place(CLIENT_A, KEY, ORDER_ID)).isTrue();
        assertThat(requests.place(CLIENT_B, KEY, ORDER_ID)).isTrue();

        assertThat(keyedCount()).isEqualTo(2);
    }

    @RepeatedTest(5)
    @DisplayName("M17 §13 · concurrent duplicates yield exactly one row")
    void concurrentDuplicates_createExactlyOneRow() throws Exception {
        CyclicBarrier bothReady = new CyclicBarrier(2);
        List<Future<Boolean>> results =
                List.of(callers.submit(() -> placeAfter(bothReady)), callers.submit(() -> placeAfter(bothReady)));

        long created = 0;
        for (Future<Boolean> result : results) {
            created += result.get(WAIT_SECONDS, TimeUnit.SECONDS) ? 1 : 0;
        }

        assertThat(created).isEqualTo(1);
        assertThat(keyedCount()).isEqualTo(1);
    }

    private boolean placeAfter(CyclicBarrier bothReady) throws Exception {
        bothReady.await(WAIT_SECONDS, TimeUnit.SECONDS);
        return requests.place(CLIENT_A, KEY, ORDER_ID);
    }

    private static long keyedCount() throws SQLException {
        try (Connection connection = openConnection()) {
            return countRows(connection, COUNT_KEYED);
        }
    }
}
