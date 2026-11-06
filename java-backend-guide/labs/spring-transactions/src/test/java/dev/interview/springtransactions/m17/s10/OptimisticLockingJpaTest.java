package dev.interview.springtransactions.m17.s10;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.springtransactions.m17.support.PostgresTestBase;
import jakarta.persistence.EntityManager;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

@SpringBootTest
class OptimisticLockingJpaTest extends PostgresTestBase {

    private static final long STOCK_ID = 1;
    private static final String LOCK_NOT_AVAILABLE = "55P03";
    private static final String ACQUIRED = "acquired";
    private static final String CREATE_STOCK = "create table if not exists stock"
            + " (id bigint primary key, quantity int not null, version bigint not null default 0)";
    private static final String TRUNCATE_STOCK = "truncate stock";
    private static final String SEED_STOCK = "insert into stock (id, quantity) values (1, 10)";
    private static final String READ_STOCK = "select quantity, version from stock where id = 1";
    private static final String LOCK_NOWAIT = "select quantity from stock where id = 1 for update nowait";

    @Autowired
    private StockService stockService;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Autowired
    private EntityManager entityManager;

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
    @DisplayName("M17 §10 · concurrent updates with @Version: exactly one commits")
    void staleCommit_failsWithOptimisticLock_whenVersionChangedMeanwhile() throws SQLException {
        assertThatThrownBy(this::removeOneWhileAnotherTransactionCommits)
                .isInstanceOf(ObjectOptimisticLockingFailureException.class);

        assertThat(quantityAndVersion()).containsExactly(9L, 1L);
    }

    @Test
    @DisplayName("M17 §10 · retrying the whole transaction after the conflict succeeds")
    void freshTransaction_succeeds_whenRetriedAfterConflict() throws SQLException {
        assertThatThrownBy(this::removeOneWhileAnotherTransactionCommits)
                .isInstanceOf(ObjectOptimisticLockingFailureException.class);

        stockService.removeOptimistic(STOCK_ID, 1);

        assertThat(quantityAndVersion()).containsExactly(8L, 2L);
    }

    @Test
    @DisplayName("M17 §10 · PESSIMISTIC_WRITE holds a row lock until commit")
    void otherLocker_failsWith55P03_whilePessimisticWriteHeld() throws SQLException {
        TransactionTemplate transaction = new TransactionTemplate(transactionManager);

        String otherLockerState = transaction.execute(status -> {
            stockService.removeLocked(STOCK_ID, 1);
            return sqlStateOfNowaitLock();
        });

        assertThat(otherLockerState).isEqualTo(LOCK_NOT_AVAILABLE);
        assertThat(quantityAndVersion()).containsExactly(9L, 1L);
    }

    // The outer transaction loads version 0; a REQUIRES_NEW transaction commits version 1 in between, so the
    // outer commit's version check matches no row.
    private void removeOneWhileAnotherTransactionCommits() {
        TransactionTemplate outer = new TransactionTemplate(transactionManager);
        TransactionTemplate concurrent = new TransactionTemplate(transactionManager);
        concurrent.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);

        outer.executeWithoutResult(status -> {
            Stock stock = entityManager.find(Stock.class, STOCK_ID);
            concurrent.executeWithoutResult(inner -> stockService.removeOptimistic(STOCK_ID, 1));
            stock.remove(1);
        });
    }

    private static String sqlStateOfNowaitLock() {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.executeQuery(LOCK_NOWAIT).close();
            return ACQUIRED;
        } catch (SQLException error) {
            return error.getSQLState();
        }
    }

    private static Object[] quantityAndVersion() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement();
                ResultSet rows = statement.executeQuery(READ_STOCK)) {
            rows.next();
            return new Object[] {rows.getLong(1), rows.getLong(2)};
        }
    }
}
