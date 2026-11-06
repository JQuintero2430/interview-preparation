package dev.interview.springtransactions.m17.s13;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.awaitility.Awaitility.await;

import dev.interview.springtransactions.m17.support.PostgresTestBase;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.Duration;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class IdleInTransactionTest extends PostgresTestBase {

    private static final Duration TERMINATION_BOUND = Duration.ofSeconds(10);
    private static final String IDLE_IN_TRANSACTION = "idle in transaction";
    private static final String SET_IDLE_TIMEOUT = "set idle_in_transaction_session_timeout = '300ms'";
    private static final String INSERT_ORDER = "insert into orders (id, customer) values (7, 'ana')";
    private static final String BACKEND_PID = "select pg_backend_pid()";
    private static final String STATE_OF_PID = "select state from pg_stat_activity where pid = ?";
    private static final String COUNT_ORDERS = "select count(*) from orders";
    private static final String NEXT_STATEMENT = "select 1";

    // 25P03 is idle_in_transaction_session_timeout; once the server has closed the socket the driver may report
    // the connection failure (08003, 08006) instead, depending on when it reads the error.
    private static final Set<String> TERMINATED_STATES = Set.of("25P03", "08003", "08006");

    @BeforeEach
    void truncate() throws SQLException {
        truncateAll();
    }

    @Test
    @DisplayName("M17 §13 · pg_stat_activity shows idle in transaction")
    void openTransaction_showsIdleInTransaction_whenClientStopsSendingQueries() throws SQLException {
        try (Connection idle = openConnection();
                Connection observer = openConnection()) {
            idle.setAutoCommit(false);
            execute(idle, INSERT_ORDER);

            assertThat(stateOf(observer, backendPid(idle))).contains(IDLE_IN_TRANSACTION);

            idle.rollback();
        }
    }

    @Test
    @DisplayName("M17 §13 · idle_in_transaction_session_timeout terminates the session")
    void idleSession_isTerminatedAndRolledBack_whenTimeoutExpires() throws SQLException {
        try (Connection idle = openConnection();
                Connection observer = openConnection()) {
            execute(idle, SET_IDLE_TIMEOUT);
            idle.setAutoCommit(false);
            execute(idle, INSERT_ORDER);
            int pid = backendPid(idle);

            await().atMost(TERMINATION_BOUND).until(() -> stateOf(observer, pid).isEmpty());
            SQLException next = catchThrowableOfType(SQLException.class, () -> execute(idle, NEXT_STATEMENT));

            assertThat(next.getSQLState()).isIn(TERMINATED_STATES);
            assertThat(countRows(observer, COUNT_ORDERS)).isZero();
        }
    }

    private static int backendPid(Connection connection) throws SQLException {
        try (Statement statement = connection.createStatement();
                ResultSet rows = statement.executeQuery(BACKEND_PID)) {
            rows.next();
            return rows.getInt(1);
        }
    }

    private static Optional<String> stateOf(Connection observer, int pid) throws SQLException {
        try (PreparedStatement query = observer.prepareStatement(STATE_OF_PID)) {
            query.setInt(1, pid);
            try (ResultSet rows = query.executeQuery()) {
                return rows.next() ? Optional.ofNullable(rows.getString(1)) : Optional.empty();
            }
        }
    }

    private static void execute(Connection connection, String sql) throws SQLException {
        try (Statement statement = connection.createStatement()) {
            statement.execute(sql);
        }
    }
}
