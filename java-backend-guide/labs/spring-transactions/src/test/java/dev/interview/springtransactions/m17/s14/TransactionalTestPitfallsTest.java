package dev.interview.springtransactions.m17.s14;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.springtransactions.m17.support.PostgresTestBase;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceException;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.transaction.BeforeTransaction;
import org.springframework.test.context.transaction.TestTransaction;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class TransactionalTestPitfallsTest extends PostgresTestBase {

    private static final long TICKET_ID = 1;
    private static final long OTHER_TICKET_ID = 2;
    private static final String SEAT = "A1";
    private static final String UNIQUE_VIOLATION = "23505";
    private static final String CREATE_TICKET =
            "create table if not exists ticket (id bigint primary key, seat text not null unique)";
    private static final String CREATE_AUDIT = "create table if not exists booking_audit (seat text not null)";
    private static final String TRUNCATE = "truncate ticket, booking_audit";
    private static final String COUNT_TICKETS = "select count(*) from ticket";
    private static final String COUNT_AUDIT = "select count(*) from booking_audit";
    private static final String JPQL_COUNT_TICKETS = "select count(t) from Ticket t";

    @Autowired
    private TicketOffice office;

    @Autowired
    private BookingNotifier notifier;

    @Autowired
    private EntityManager entityManager;

    @BeforeAll
    static void createTables() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(CREATE_TICKET);
            statement.execute(CREATE_AUDIT);
        }
    }

    @BeforeTransaction
    void cleanSlate() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(TRUNCATE);
        }
        notifier.clear();
    }

    @Test
    @DisplayName("M17 §14 · a @Transactional test rolls back by default")
    void testTransaction_rollsBack_whenNotFlaggedForCommit() throws SQLException {
        office.book(TICKET_ID, SEAT);

        assertThat(entityManager.createQuery(JPQL_COUNT_TICKETS, Long.class).getSingleResult())
                .isEqualTo(1);
        assertThat(TestTransaction.isFlaggedForRollback()).isTrue();
        TestTransaction.end();

        assertThat(count(COUNT_TICKETS)).isZero();
    }

    @Test
    @DisplayName("M17 §14 · rolled-back test never runs AFTER_COMMIT listener")
    void afterCommitListener_neverRuns_whenTestRollsBack() {
        office.book(TICKET_ID, SEAT);

        TestTransaction.end();

        assertThat(notifier.notified()).isEmpty();
    }

    @Test
    @DisplayName("M17 §14 · flagForCommit runs the listener and keeps the row")
    void afterCommitListener_runs_whenTestFlaggedForCommit() throws SQLException {
        office.book(TICKET_ID, SEAT);

        TestTransaction.flagForCommit();
        TestTransaction.end();

        assertThat(notifier.notified()).containsExactly(SEAT);
        assertThat(count(COUNT_TICKETS)).isEqualTo(1);
    }

    @Test
    @DisplayName("M17 §14 · constraint violation appears only on flush")
    void duplicateSeat_failsOnlyOnFlush() {
        assertThatCode(() -> {
                    office.book(TICKET_ID, SEAT);
                    office.book(OTHER_TICKET_ID, SEAT);
                })
                .doesNotThrowAnyException();

        assertThatThrownBy(entityManager::flush)
                .isInstanceOf(PersistenceException.class)
                .rootCause()
                .isInstanceOfSatisfying(
                        SQLException.class,
                        error -> assertThat(error.getSQLState()).isEqualTo(UNIQUE_VIOLATION));
    }

    @Test
    @DisplayName("M17 §14 · REQUIRES_NEW commit survives the test rollback")
    void requiresNewWrite_survives_whenTestRollsBack() throws SQLException {
        office.book(TICKET_ID, SEAT);

        TestTransaction.end();

        assertThat(count(COUNT_TICKETS)).isZero();
        assertThat(count(COUNT_AUDIT)).isEqualTo(1);
    }

    private static long count(String countQuery) throws SQLException {
        try (Connection connection = openConnection()) {
            return countRows(connection, countQuery);
        }
    }
}
