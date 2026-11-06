package dev.interview.springtransactions.m17.s13;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.zaxxer.hikari.HikariDataSource;
import dev.interview.springtransactions.m17.support.PostgresTestBase;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.SQLTransientConnectionException;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.CannotCreateTransactionException;
import org.springframework.transaction.support.TransactionTemplate;

class PoolExhaustionTest extends PostgresTestBase {

    private static final int POOL_SIZE = 2;
    private static final long CONNECTION_TIMEOUT_MS = 250;
    private static final long WAIT_SECONDS = 10;
    private static final long SLOW_ORDER_1 = 1;
    private static final long SLOW_ORDER_2 = 2;
    private static final long FAST_ORDER = 3;
    private static final String CUSTOMER = "ana";
    private static final String COUNT_ORDERS = "select count(*) from orders";
    private static final String TIMED_OUT = "Connection is not available, request timed out after";

    private final CountDownLatch entered = new CountDownLatch(POOL_SIZE);
    private final CountDownLatch release = new CountDownLatch(1);

    private HikariDataSource dataSource;
    private ExecutorService callers;
    private Checkout checkout;

    @BeforeEach
    void wire() throws SQLException {
        truncateAll();
        dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(POSTGRES.getJdbcUrl());
        dataSource.setUsername(POSTGRES.getUsername());
        dataSource.setPassword(POSTGRES.getPassword());
        dataSource.setMaximumPoolSize(POOL_SIZE);
        dataSource.setConnectionTimeout(CONNECTION_TIMEOUT_MS);
        dataSource.getConnection().close(); // HikariDataSource starts its pool on the first getConnection
        callers = Executors.newFixedThreadPool(POOL_SIZE);
        checkout = new Checkout(
                new TransactionTemplate(new DataSourceTransactionManager(dataSource)),
                JdbcClient.create(dataSource),
                this::slowForFirstTwoOrders);
    }

    @AfterEach
    void close() {
        release.countDown();
        callers.shutdownNow();
        dataSource.close();
    }

    @Test
    @DisplayName("M17 §13 · slow call inside transaction exhausts a small pool")
    void thirdCaller_timesOutOnPool_whenTwoTransactionsWaitOnRemoteCall() throws Exception {
        List<Future<?>> slow = List.of(
                callers.submit(() -> checkout.payInsideTransaction(SLOW_ORDER_1, CUSTOMER)),
                callers.submit(() -> checkout.payInsideTransaction(SLOW_ORDER_2, CUSTOMER)));
        assertThat(entered.await(WAIT_SECONDS, TimeUnit.SECONDS)).isTrue();

        assertThat(dataSource.getHikariPoolMXBean().getActiveConnections()).isEqualTo(POOL_SIZE);
        assertThatThrownBy(() -> checkout.payInsideTransaction(FAST_ORDER, CUSTOMER))
                .isInstanceOf(CannotCreateTransactionException.class)
                .rootCause()
                .isInstanceOf(SQLTransientConnectionException.class)
                .hasMessageContaining(TIMED_OUT);

        finish(slow);
        assertThat(orderCount()).isEqualTo(2);
    }

    @Test
    @DisplayName("M17 §13 · remote call outside the transaction holds no connection")
    void thirdCaller_commits_whenRemoteCallsRunBeforeTheTransaction() throws Exception {
        List<Future<?>> slow = List.of(
                callers.submit(() -> checkout.payThenRecord(SLOW_ORDER_1, CUSTOMER)),
                callers.submit(() -> checkout.payThenRecord(SLOW_ORDER_2, CUSTOMER)));
        assertThat(entered.await(WAIT_SECONDS, TimeUnit.SECONDS)).isTrue();

        assertThat(dataSource.getHikariPoolMXBean().getActiveConnections()).isZero();
        checkout.payThenRecord(FAST_ORDER, CUSTOMER);

        finish(slow);
        assertThat(orderCount()).isEqualTo(3);
    }

    // Stands in for a payment provider that answers slowly: the first two orders wait until the test releases them.
    private void slowForFirstTwoOrders(long orderId) {
        if (orderId == FAST_ORDER) {
            return;
        }
        entered.countDown();
        try {
            assertThat(release.await(WAIT_SECONDS, TimeUnit.SECONDS)).isTrue();
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(interrupted);
        }
    }

    private void finish(List<Future<?>> slow) throws Exception {
        release.countDown();
        for (Future<?> call : slow) {
            call.get(WAIT_SECONDS, TimeUnit.SECONDS);
        }
    }

    private static long orderCount() throws SQLException {
        try (Connection connection = openConnection()) {
            return countRows(connection, COUNT_ORDERS);
        }
    }
}
