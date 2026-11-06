package dev.interview.springtransactions.m17.ex2;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.zaxxer.hikari.HikariDataSource;
import dev.interview.springtransactions.m17.support.PostgresTestBase;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.function.LongConsumer;
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
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.EnableTransactionManagement;

class AuditTrailRepairTest extends PostgresTestBase {

    private static final int POOL_SIZE = 2;
    private static final int CALLERS = 4;
    private static final long CONNECTION_TIMEOUT_MS = 1_000;
    private static final Duration TIMEOUT_BOUND = Duration.ofMillis(CONNECTION_TIMEOUT_MS);
    private static final long GATE_TIMEOUT_SECONDS = 5;
    private static final String CREATE_AUDIT_TABLE =
            "create table if not exists audit_log (order_id bigint not null, action text not null)";
    private static final String TRUNCATE_AUDIT = "truncate audit_log";
    private static final String DISABLE_AUDIT = "alter table audit_log rename to audit_log_offline";
    private static final String ENABLE_AUDIT = "alter table audit_log_offline rename to audit_log";
    private static final String COUNT_ORDERS = "select count(*) from orders";
    private static final String COUNT_LINES = "select count(*) from order_line";
    private static final String COUNT_AUDIT = "select count(*) from audit_log";
    private static final String AUDIT_ACTIONS = "select action from audit_log";
    private static final String CUSTOMER = "ana";
    private static final String SKU = "SKU-1";

    private AnnotationConfigApplicationContext context;

    @BeforeAll
    static void createAuditTable() throws SQLException {
        execute(CREATE_AUDIT_TABLE);
    }

    @BeforeEach
    void startContext() throws SQLException {
        execute(TRUNCATE_AUDIT);
        truncateAll();
        context = new AnnotationConfigApplicationContext(TxConfig.class);
        warmPool(context.getBean(DataSource.class));
    }

    // Opens every pooled connection once, so the timed calls do not include connection setup.
    private static void warmPool(DataSource dataSource) throws SQLException {
        try (Connection first = dataSource.getConnection();
                Connection second = dataSource.getConnection()) {
            assertThat(first).isNotSameAs(second);
        }
    }

    @AfterEach
    void closeContext() {
        context.close();
    }

    @Test
    @DisplayName("Ex17.2 · (1) the audit row exists after the business transaction rolls back")
    void auditRowSurvivesRollback() throws SQLException {
        CheckoutService checkout = context.getBean(CheckoutService.class);

        assertThatThrownBy(() -> checkout.checkout(1, CUSTOMER, SKU, 0))
                .isInstanceOf(DataIntegrityViolationException.class);

        assertCounts(0, 0, 1);
        assertThat(auditActions()).containsExactly(CheckoutService.ORDER_FAILED);
    }

    @Test
    @DisplayName("Ex17.2 · (2) pool of 2, 4 concurrent callers: every call finishes within the timeout bound")
    void concurrentCallersFinishWithinTimeoutBound() throws SQLException {
        CheckoutService checkout = context.getBean(CheckoutService.class);
        context.getBean(GatedTransactionManager.class).gateFirstTransactionPerCaller();

        List<CallOutcome> outcomes = callConcurrently(orderId -> checkout.checkout(orderId, CUSTOMER, SKU, 1));

        assertThat(outcomes).hasSize(CALLERS).allSatisfy(outcome -> {
            assertThat(outcome.failure()).isNull();
            assertThat(outcome.elapsed()).isLessThan(TIMEOUT_BOUND);
        });
        assertCounts(CALLERS, CALLERS, CALLERS);
    }

    @Test
    @DisplayName("Ex17.2 · (2) before the fix, the same load times out on the pool")
    void brokenCheckoutTimesOutOnThePool() {
        var broken = context.getBean(dev.interview.springtransactions.m17.ex2.broken.CheckoutService.class);
        context.getBean(GatedTransactionManager.class).gateFirstTransactionPerCaller();

        List<CallOutcome> outcomes = callConcurrently(orderId -> broken.checkout(orderId, CUSTOMER, SKU, 1));

        // Permitted outcomes, not one interleaving: which callers time out depends on who gets a connection first,
        // but while every connection is held by a caller waiting for a second one, someone must time out.
        assertThat(outcomes)
                .anySatisfy(
                        outcome -> assertThat(outcome.failure()).isInstanceOf(CannotCreateTransactionException.class));
    }

    @Test
    @DisplayName("Ex17.2 · (3) an audit failure does not roll back the business transaction")
    void auditFailureKeepsTheOrder() throws SQLException {
        CheckoutService checkout = context.getBean(CheckoutService.class);

        execute(DISABLE_AUDIT);
        try {
            assertThatCode(() -> checkout.checkout(1, CUSTOMER, SKU, 1)).doesNotThrowAnyException();
        } finally {
            execute(ENABLE_AUDIT);
        }

        assertCounts(1, 1, 0);
    }

    private static List<CallOutcome> callConcurrently(LongConsumer call) {
        try (ExecutorService callers = Executors.newFixedThreadPool(CALLERS)) {
            List<Future<CallOutcome>> calls = LongStream.rangeClosed(1, CALLERS)
                    .mapToObj(orderId -> callers.submit(() -> timed(call, orderId)))
                    .toList();
            return calls.stream().map(AuditTrailRepairTest::join).toList();
        }
    }

    private static CallOutcome timed(LongConsumer call, long orderId) {
        long start = System.nanoTime();
        try {
            call.accept(orderId);
            return new CallOutcome(null, Duration.ofNanos(System.nanoTime() - start));
        } catch (RuntimeException ex) {
            return new CallOutcome(ex, Duration.ofNanos(System.nanoTime() - start));
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

    private static void execute(String sql) throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(sql);
        }
    }

    private static List<String> auditActions() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement();
                ResultSet rows = statement.executeQuery(AUDIT_ACTIONS)) {
            List<String> actions = new ArrayList<>();
            while (rows.next()) {
                actions.add(rows.getString(1));
            }
            return actions;
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

    /**
     * Forces the worst case once enabled: each caller's first transaction waits, connection in hand, until
     * {@code POOL_SIZE} callers hold one, so every connection is borrowed at the same moment. Off by default, so
     * single-caller tests never wait at the gate.
     */
    static final class GatedTransactionManager extends DataSourceTransactionManager {

        private final transient CyclicBarrier gate = new CyclicBarrier(POOL_SIZE);
        private final transient ThreadLocal<Boolean> passed = ThreadLocal.withInitial(() -> false);
        private volatile boolean enabled;

        GatedTransactionManager(DataSource dataSource) {
            super(dataSource);
        }

        void gateFirstTransactionPerCaller() {
            enabled = true;
        }

        @Override
        protected void doBegin(Object transaction, TransactionDefinition definition) {
            super.doBegin(transaction, definition);
            if (enabled && !passed.get()) {
                passed.set(true);
                awaitGate();
            }
        }

        private void awaitGate() {
            try {
                gate.await(GATE_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException(ex);
            } catch (BrokenBarrierException | TimeoutException ex) {
                throw new IllegalStateException(ex);
            }
        }
    }

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
        GatedTransactionManager transactionManager(DataSource dataSource) {
            return new GatedTransactionManager(dataSource);
        }

        @Bean
        JdbcClient jdbcClient(DataSource dataSource) {
            return JdbcClient.create(dataSource);
        }

        @Bean
        AuditTrail auditTrail(JdbcClient jdbc) {
            return new AuditTrail(jdbc);
        }

        @Bean
        OrderPlacement orderPlacement(JdbcClient jdbc) {
            return new OrderPlacement(jdbc);
        }

        @Bean
        CheckoutService checkoutService(OrderPlacement placement, AuditTrail auditTrail) {
            return new CheckoutService(placement, auditTrail);
        }

        @Bean
        dev.interview.springtransactions.m17.ex2.broken.AuditTrail brokenAuditTrail(JdbcClient jdbc) {
            return new dev.interview.springtransactions.m17.ex2.broken.AuditTrail(jdbc);
        }

        @Bean
        dev.interview.springtransactions.m17.ex2.broken.CheckoutService brokenCheckoutService(
                JdbcClient jdbc, dev.interview.springtransactions.m17.ex2.broken.AuditTrail auditTrail) {
            return new dev.interview.springtransactions.m17.ex2.broken.CheckoutService(jdbc, auditTrail);
        }
    }
}
