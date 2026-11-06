package dev.interview.springtransactions.m17.s06;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.zaxxer.hikari.HikariDataSource;
import dev.interview.springtransactions.m17.support.PostgresTestBase;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.SQLTransientConnectionException;
import java.sql.Statement;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.stream.LongStream;
import javax.sql.DataSource;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.CannotCreateTransactionException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.TransactionTemplate;

class PropagationPostgresTest extends PostgresTestBase {

    private static final int POOL_SIZE = 2;
    private static final long CONNECTION_TIMEOUT_MS = 500;
    private static final Duration LOWER_BOUND = Duration.ofMillis(450);
    private static final Duration UPPER_BOUND = Duration.ofSeconds(10);
    private static final long BARRIER_TIMEOUT_SECONDS = 10;
    private static final String CREATE_AUDIT_TABLE =
            "create table if not exists audit_log (order_id bigint not null, action text not null)";
    private static final String TRUNCATE_AUDIT = "truncate audit_log";
    private static final String COUNT_ORDERS = "select count(*) from orders";
    private static final String COUNT_LINES = "select count(*) from order_line";
    private static final String COUNT_AUDIT = "select count(*) from audit_log";
    private static final String CUSTOMER = "ana";
    private static final String SKU = "SKU-1";
    private static final String ACTION = "order placed";
    private static final String COULD_NOT_OPEN = "Could not open JDBC Connection for transaction";
    private static final String POOL_TIMED_OUT = "Connection is not available, request timed out after";

    private AnnotationConfigApplicationContext context;

    @BeforeAll
    static void createAuditTable() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(CREATE_AUDIT_TABLE);
        }
    }

    @BeforeEach
    void startContext() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(TRUNCATE_AUDIT);
        }
        truncateAll();
        context = new AnnotationConfigApplicationContext(TxConfig.class);
    }

    @AfterEach
    void closeContext() {
        context.close();
    }

    @Test
    @DisplayName("M17 §6 · REQUIRED order and REQUIRES_NEW audit both commit on success")
    void placeOrderCommitsOrderLineAndAudit() throws SQLException {
        OrderService orders = context.getBean(OrderService.class);

        orders.placeOrder(1, CUSTOMER, SKU, 1);

        assertCounts(1, 1, 1);
    }

    @Test
    @DisplayName("M17 §6 · NESTED success commits with the outer transaction")
    void nestedSuccessCommitsWithOuter() throws SQLException {
        OrderService orders = context.getBean(OrderService.class);

        boolean lineAdded = orders.placeOrderKeepingHeader(1, CUSTOMER, SKU, 1);

        assertThat(lineAdded).isTrue();
        assertCounts(1, 1, 0);
    }

    @Test
    @DisplayName("M17 §6 · REQUIRES_NEW row survives outer rollback")
    void requiresNewRowSurvivesOuterRollback() throws SQLException {
        OrderService orders = context.getBean(OrderService.class);

        assertThatThrownBy(() -> orders.placeOrder(1, CUSTOMER, SKU, 0))
                .isInstanceOf(DataIntegrityViolationException.class);

        assertCounts(0, 0, 1);
    }

    @Test
    @DisplayName("M17 §6 · NESTED failure rolls back to the savepoint only")
    void nestedFailureRollsBackToSavepointOnly() throws SQLException {
        OrderService orders = context.getBean(OrderService.class);

        boolean lineAdded = orders.placeOrderKeepingHeader(1, CUSTOMER, SKU, 0);

        assertThat(lineAdded).isFalse();
        assertCounts(1, 0, 0);
    }

    @Test
    @DisplayName("M17 §6 · pool of N with N concurrent REQUIRES_NEW callers: at least one times out")
    void poolOfNWithNConcurrentRequiresNewCallersTimesOut() throws Exception {
        AuditLog auditLog = context.getBean(AuditLog.class);
        TransactionTemplate outer = new TransactionTemplate(context.getBean(PlatformTransactionManager.class));
        CyclicBarrier everyCallerHoldsOneConnection = new CyclicBarrier(POOL_SIZE);

        List<CallOutcome> outcomes;
        try (ExecutorService callers = Executors.newFixedThreadPool(POOL_SIZE)) {
            List<Future<CallOutcome>> calls = LongStream.rangeClosed(1, POOL_SIZE)
                    .mapToObj(orderId -> callers.submit(
                            () -> auditInsideOuter(outer, everyCallerHoldsOneConnection, auditLog, orderId)))
                    .toList();
            outcomes = calls.stream().map(PropagationPostgresTest::join).toList();
        }

        // Permitted outcomes, not one interleaving: the first caller to time out rolls back its outer transaction
        // and returns its connection, so a caller still waiting may take it and finish. At least one caller always
        // hits the pool timeout, and nobody finishes before someone has waited the full timeout.
        List<CallOutcome> failures =
                outcomes.stream().filter(outcome -> outcome.failure() != null).toList();
        assertThat(failures)
                .isNotEmpty()
                .allSatisfy(outcome -> assertThat(outcome.failure())
                        .isInstanceOf(CannotCreateTransactionException.class)
                        .hasMessage(COULD_NOT_OPEN)
                        .rootCause()
                        .isInstanceOf(SQLTransientConnectionException.class)
                        .hasMessageContaining(POOL_TIMED_OUT));
        assertThat(outcomes)
                .hasSize(POOL_SIZE)
                .allSatisfy(outcome -> assertThat(outcome.elapsed()).isBetween(LOWER_BOUND, UPPER_BOUND));
        assertCounts(0, 0, outcomes.size() - failures.size());
    }

    private static CallOutcome auditInsideOuter(
            TransactionTemplate outer, CyclicBarrier barrier, AuditLog auditLog, long orderId) {
        long start = System.nanoTime();
        try {
            outer.executeWithoutResult(status -> {
                awaitBarrier(barrier);
                auditLog.record(orderId, ACTION);
            });
            return new CallOutcome(null, Duration.ofNanos(System.nanoTime() - start));
        } catch (RuntimeException ex) {
            return new CallOutcome(ex, Duration.ofNanos(System.nanoTime() - start));
        }
    }

    private static void awaitBarrier(CyclicBarrier barrier) {
        try {
            barrier.await(BARRIER_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(ex);
        } catch (BrokenBarrierException | TimeoutException ex) {
            throw new IllegalStateException(ex);
        }
    }

    private static CallOutcome join(Future<CallOutcome> call) {
        try {
            return call.get();
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(ex);
        } catch (ExecutionException ex) {
            throw new IllegalStateException(ex);
        }
    }

    private static void assertCounts(long orders, long lines, long audits) throws SQLException {
        try (Connection connection = openConnection()) {
            assertThat(countRows(connection, COUNT_ORDERS)).isEqualTo(orders);
            assertThat(countRows(connection, COUNT_LINES)).isEqualTo(lines);
            assertThat(countRows(connection, COUNT_AUDIT)).isEqualTo(audits);
        }
    }

    private record CallOutcome(RuntimeException failure, Duration elapsed) {}

    @Configuration(proxyBeanMethods = false)
    @EnableTransactionManagement
    static class TxConfig {

        @Bean
        HikariDataSource dataSource() {
            HikariDataSource dataSource = new HikariDataSource();
            dataSource.setJdbcUrl(POSTGRES.getJdbcUrl());
            dataSource.setUsername(POSTGRES.getUsername());
            dataSource.setPassword(POSTGRES.getPassword());
            dataSource.setMaximumPoolSize(POOL_SIZE);
            dataSource.setConnectionTimeout(CONNECTION_TIMEOUT_MS);
            return dataSource;
        }

        @Bean
        DataSourceTransactionManager transactionManager(DataSource dataSource) {
            return new DataSourceTransactionManager(dataSource);
        }

        @Bean
        JdbcClient jdbcClient(DataSource dataSource) {
            return JdbcClient.create(dataSource);
        }

        @Bean
        AuditLog auditLog(JdbcClient jdbc) {
            return new AuditLog(jdbc);
        }

        @Bean
        OrderLines orderLines(JdbcClient jdbc) {
            return new OrderLines(jdbc);
        }

        @Bean
        OrderService orderService(JdbcClient jdbc, AuditLog auditLog, OrderLines orderLines) {
            return new OrderService(jdbc, auditLog, orderLines);
        }
    }
}
