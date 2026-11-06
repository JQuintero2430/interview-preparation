package dev.interview.springtransactions.m17.s07;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.springtransactions.m17.support.PostgresTestBase;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class IsolationAnomaliesTest extends PostgresTestBase {

    private static final String SERIALIZATION_FAILURE = "40001";
    private static final String OLD_CUSTOMER = "ana";
    private static final String NEW_CUSTOMER = "bea";
    private static final String CREATE_ON_CALL = "create table if not exists on_call"
            + " (shift_id bigint, doctor text, on_call boolean not null, primary key (shift_id, doctor))";
    private static final String TRUNCATE_ON_CALL = "truncate on_call";
    private static final String SEED_ORDER = "insert into orders (id, customer) values (1, 'ana')";
    private static final String SEED_ON_CALL = "insert into on_call values (1, 'ana', true), (1, 'ben', true)";
    private static final String READ_CUSTOMER = "select customer from orders where id = 1";
    private static final String RENAME_CUSTOMER = "update orders set customer = 'bea' where id = 1";
    private static final String INSERT_SECOND_ORDER = "insert into orders (id, customer) values (2, 'ben')";
    private static final String COUNT_ORDERS = "select count(*) from orders";
    private static final String COUNT_ON_CALL = "select count(*) from on_call where shift_id = 1 and on_call = true";
    private static final String ANA_OFF_CALL =
            "update on_call set on_call = false where shift_id = 1 and doctor = 'ana'";
    private static final String BEN_OFF_CALL =
            "update on_call set on_call = false where shift_id = 1 and doctor = 'ben'";

    @BeforeAll
    static void createOnCallTable() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(CREATE_ON_CALL);
        }
    }

    @BeforeEach
    void seed() throws SQLException {
        truncateAll();
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(TRUNCATE_ON_CALL);
            statement.execute(SEED_ORDER);
            statement.execute(SEED_ON_CALL);
        }
    }

    // PostgreSQL takes a transaction's snapshot at its first statement, not at begin, so every test reads in
    // the first transaction before the second one commits; otherwise the snapshot would already include it.

    @Test
    @DisplayName("M17 §7 · read committed allows non-repeatable read")
    void reread_seesCommittedChange_whenReadCommitted() throws SQLException {
        try (Connection reader = begin(Connection.TRANSACTION_READ_COMMITTED);
                Connection writer = begin(Connection.TRANSACTION_READ_COMMITTED)) {
            String firstRead = readCustomer(reader);
            execute(writer, RENAME_CUSTOMER);
            writer.commit();

            String secondRead = readCustomer(reader);

            assertThat(firstRead).isEqualTo(OLD_CUSTOMER);
            assertThat(secondRead).isEqualTo(NEW_CUSTOMER);
        }
    }

    @Test
    @DisplayName("M17 §7 · repeatable read prevents it")
    void reread_seesSnapshotValue_whenRepeatableRead() throws SQLException {
        try (Connection reader = begin(Connection.TRANSACTION_REPEATABLE_READ);
                Connection writer = begin(Connection.TRANSACTION_READ_COMMITTED)) {
            String firstRead = readCustomer(reader);
            execute(writer, RENAME_CUSTOMER);
            writer.commit();

            String secondRead = readCustomer(reader);

            assertThat(firstRead).isEqualTo(OLD_CUSTOMER);
            assertThat(secondRead).isEqualTo(OLD_CUSTOMER);
        }
    }

    @Test
    @DisplayName("M17 §7 · read uncommitted never shows uncommitted changes in PostgreSQL")
    void read_ignoresUncommittedChange_whenReadUncommitted() throws SQLException {
        try (Connection reader = begin(Connection.TRANSACTION_READ_UNCOMMITTED);
                Connection writer = begin(Connection.TRANSACTION_READ_COMMITTED)) {
            execute(writer, RENAME_CUSTOMER);

            String read = readCustomer(reader);
            writer.rollback();

            assertThat(read).isEqualTo(OLD_CUSTOMER);
        }
    }

    @Test
    @DisplayName("M17 §7 · repeatable read prevents phantoms in PostgreSQL")
    void recount_ignoresCommittedInsert_whenRepeatableRead() throws SQLException {
        try (Connection reader = begin(Connection.TRANSACTION_REPEATABLE_READ);
                Connection writer = begin(Connection.TRANSACTION_READ_COMMITTED)) {
            long firstCount = countRows(reader, COUNT_ORDERS);
            execute(writer, INSERT_SECOND_ORDER);
            writer.commit();

            long secondCount = countRows(reader, COUNT_ORDERS);

            assertThat(firstCount).isEqualTo(1);
            assertThat(secondCount).isEqualTo(1);
        }
    }

    @Test
    @DisplayName("M17 §7 · repeatable read allows write skew")
    void bothDoctorsLeave_commit_whenRepeatableRead() throws SQLException {
        try (Connection first = begin(Connection.TRANSACTION_REPEATABLE_READ);
                Connection second = begin(Connection.TRANSACTION_REPEATABLE_READ)) {
            assertThat(countRows(first, COUNT_ON_CALL)).isEqualTo(2);
            assertThat(countRows(second, COUNT_ON_CALL)).isEqualTo(2);

            execute(first, ANA_OFF_CALL);
            execute(second, BEN_OFF_CALL);
            first.commit();
            second.commit();

            assertThat(onCallAfterwards()).isZero();
        }
    }

    @Test
    @DisplayName("M17 §7 · serializable rejects write skew (one commits, the other fails 40001)")
    void oneDoctorLeave_failsWith40001_whenSerializable() throws SQLException {
        try (Connection first = begin(Connection.TRANSACTION_SERIALIZABLE);
                Connection second = begin(Connection.TRANSACTION_SERIALIZABLE)) {
            assertThat(countRows(first, COUNT_ON_CALL)).isEqualTo(2);
            assertThat(countRows(second, COUNT_ON_CALL)).isEqualTo(2);
            Attempt firstAttempt = new Attempt(first);
            Attempt secondAttempt = new Attempt(second);

            firstAttempt.step(connection -> execute(connection, ANA_OFF_CALL));
            secondAttempt.step(connection -> execute(connection, BEN_OFF_CALL));
            firstAttempt.step(Connection::commit);
            secondAttempt.step(Connection::commit);

            List<String> failures = new ArrayList<>(firstAttempt.failureStates);
            failures.addAll(secondAttempt.failureStates);
            assertThat(failures).containsExactly(SERIALIZATION_FAILURE);
            assertThat(onCallAfterwards()).isEqualTo(1);
        }
    }

    private static Connection begin(int isolationLevel) throws SQLException {
        Connection connection = openConnection();
        connection.setAutoCommit(false);
        connection.setTransactionIsolation(isolationLevel);
        return connection;
    }

    private static String readCustomer(Connection connection) throws SQLException {
        try (Statement statement = connection.createStatement();
                ResultSet rows = statement.executeQuery(READ_CUSTOMER)) {
            rows.next();
            return rows.getString(1);
        }
    }

    private static void execute(Connection connection, String sql) throws SQLException {
        try (Statement statement = connection.createStatement()) {
            statement.execute(sql);
        }
    }

    private static long onCallAfterwards() throws SQLException {
        try (Connection connection = openConnection()) {
            return countRows(connection, COUNT_ON_CALL);
        }
    }

    @FunctionalInterface
    private interface SqlStep {
        void run(Connection connection) throws SQLException;
    }

    // SSI may abort either transaction, at its update or at its commit, so each step is attempted only while
    // its transaction is still alive and the failure is recorded instead of assuming where it lands.
    private static final class Attempt {

        private final Connection connection;
        private final List<String> failureStates = new ArrayList<>();

        private Attempt(Connection connection) {
            this.connection = connection;
        }

        private void step(SqlStep sqlStep) throws SQLException {
            if (!failureStates.isEmpty()) {
                return;
            }
            try {
                sqlStep.run(connection);
            } catch (SQLException failure) {
                failureStates.add(failure.getSQLState());
                connection.rollback();
            }
        }
    }
}
