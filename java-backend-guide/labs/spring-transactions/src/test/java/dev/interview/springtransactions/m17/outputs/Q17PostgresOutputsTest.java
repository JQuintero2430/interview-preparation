package dev.interview.springtransactions.m17.outputs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.springtransactions.m17.support.PostgresTestBase;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import javax.sql.DataSource;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/** Output questions of module 17 that need PostgreSQL (route R2). */
class Q17PostgresOutputsTest extends PostgresTestBase {

    private static final String CREATE_AUDIT =
            "create table if not exists order_audit (order_id bigint not null, event text not null)";
    private static final String TRUNCATE_AUDIT = "truncate order_audit";
    private static final String COUNT_ORDERS = "select count(*) from orders";
    private static final String COUNT_AUDIT = "select count(*) from order_audit";
    private static final String FAILURE = "payment declined";
    private static final String CREATE_ON_CALL = "create table if not exists on_call"
            + " (shift_id bigint, doctor text, on_call boolean not null, primary key (shift_id, doctor))";
    private static final String TRUNCATE_ON_CALL = "truncate on_call";
    private static final String SEED_ON_CALL = "insert into on_call values (1, 'ana', true), (1, 'ben', true)";
    private static final String COUNT_ON_CALL = "select count(*) from on_call where shift_id = 1 and on_call = true";
    private static final String ANA_OFF_CALL =
            "update on_call set on_call = false where shift_id = 1 and doctor = 'ana'";
    private static final String BEN_OFF_CALL =
            "update on_call set on_call = false where shift_id = 1 and doctor = 'ben'";
    private static final long SHIFT = 1;
    private static final String ANA = "ana";
    private static final String BEN = "ben";
    private static final String LEFT = "left";
    private static final String STAYED = "stayed";
    private static final String COMMITTED = "committed";
    private static final String SERIALIZATION_FAILURE = "40001";
    private static final String DEADLOCK_DETECTED = "40P01";
    private static final long BOUND_SECONDS = 10;
    private static final String COUNT_INVOICES_TX_NAME = Q17_29.Invoices.class.getName() + ".countOrders";

    private AnnotationConfigApplicationContext context;

    @BeforeAll
    static void createAuditTable() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(CREATE_AUDIT);
            statement.execute(CREATE_ON_CALL);
        }
    }

    @BeforeEach
    void start() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(TRUNCATE_AUDIT);
            statement.execute(TRUNCATE_ON_CALL);
            statement.execute(SEED_ON_CALL);
        }
        truncateAll();
        context = new AnnotationConfigApplicationContext(TwoDataSourcesConfig.class);
    }

    @AfterEach
    void close() {
        context.close();
    }

    @Test
    @DisplayName("Q17.03 · the write through the unmanaged DataSource survives the rollback")
    void q17_03() throws SQLException {
        Q17_03 checkout = context.getBean(Q17_03.class);

        assertThatThrownBy(() -> checkout.placeOrder(1))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage(FAILURE);

        try (Connection connection = openConnection()) {
            assertThat(countRows(connection, COUNT_ORDERS)).isZero();
            assertThat(countRows(connection, COUNT_AUDIT)).isEqualTo(1);
        }
    }

    @Test
    @DisplayName("Q17.14 · the REQUIRES_NEW audit row survives the outer rollback")
    void q17_14() throws SQLException {
        Q17_14 checkout = context.getBean(Q17_14.class);

        assertThatThrownBy(() -> checkout.placeOrder(1))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage(FAILURE);

        try (Connection connection = openConnection()) {
            assertThat(countRows(connection, COUNT_ORDERS)).isZero();
            assertThat(countRows(connection, COUNT_AUDIT)).isEqualTo(1);
        }
    }

    @Test
    @DisplayName("Q17.14 · a failed REQUIRES_NEW audit does not doom the caller")
    void q17_14_auditFails() throws SQLException {
        context.getBean(Q17_14.class).placeOrderDespiteAuditFailure(1);

        try (Connection connection = openConnection()) {
            assertThat(countRows(connection, COUNT_ORDERS)).isEqualTo(1);
            assertThat(countRows(connection, COUNT_AUDIT)).isZero();
        }
    }

    @Test
    @DisplayName("Q17.19 · REPEATABLE_READ: both doctors leave and nobody is on call")
    void q17_19_repeatableRead() throws Exception {
        Q17_19 roster = context.getBean(Q17_19.class);

        List<String> outcomes = concurrently(
                () -> roster.goOffCallRepeatableRead(SHIFT, ANA), () -> roster.goOffCallRepeatableRead(SHIFT, BEN));

        assertThat(outcomes).containsExactly(LEFT, LEFT);
        assertThat(onCallAfterwards()).isZero();
    }

    @Test
    @DisplayName("Q17.19 · SERIALIZABLE: one doctor leaves, the other fails with 40001")
    void q17_19_serializable() throws Exception {
        Q17_19 roster = context.getBean(Q17_19.class);

        List<String> outcomes = concurrently(
                () -> roster.goOffCallSerializable(SHIFT, ANA), () -> roster.goOffCallSerializable(SHIFT, BEN));

        // SSI does not promise which transaction is aborted, so only the set of outcomes is asserted.
        assertThat(outcomes).containsExactlyInAnyOrder(LEFT, SERIALIZATION_FAILURE);
        assertThat(onCallAfterwards()).isEqualTo(1);
    }

    @Test
    @DisplayName("Q17.20 · SERIALIZABLE does not prevent a lock-order deadlock (40P01)")
    void q17_20() throws Exception {
        List<String> outcomes;
        try (Connection first = beginSerializable();
                Connection second = beginSerializable()) {
            execute(first, ANA_OFF_CALL);
            execute(second, BEN_OFF_CALL);

            outcomes = concurrentlyRaw(
                    () -> updateThenCommit(first, BEN_OFF_CALL), () -> updateThenCommit(second, ANA_OFF_CALL));
        }

        assertThat(outcomes).containsExactlyInAnyOrder(DEADLOCK_DETECTED, COMMITTED);
    }

    @Test
    @DisplayName("Q17.29 · the @Async method runs in its own transaction and sees no uncommitted row")
    void q17_29() throws SQLException {
        Q17_29.Seen seen = context.getBean(Q17_29.class).placeOrderAndWait(1);

        assertThat(seen).isEqualTo(new Q17_29.Seen(COUNT_INVOICES_TX_NAME, 0));
        try (Connection connection = openConnection()) {
            assertThat(countRows(connection, COUNT_ORDERS)).isEqualTo(1);
        }
    }

    @Test
    @DisplayName("Q17.29 · fire and forget: its own transaction, and 0 or 1 rows depending on timing")
    void q17_29_fireAndForget() throws Exception {
        CompletableFuture<Q17_29.Seen> invoice = context.getBean(Q17_29.class).placeOrder(2);

        // the async read may run before or after the caller's commit, so both counts are permitted
        Q17_29.Seen seen = invoice.get(BOUND_SECONDS, TimeUnit.SECONDS);
        assertThat(seen.transaction()).isEqualTo(COUNT_INVOICES_TX_NAME);
        assertThat(seen.orders()).isIn(0L, 1L);
        try (Connection connection = openConnection()) {
            assertThat(countRows(connection, COUNT_ORDERS)).isEqualTo(1);
        }
    }

    private static List<String> concurrently(Callable<Boolean> first, Callable<Boolean> second) throws Exception {
        return concurrentlyRaw(() -> outcomeOf(first), () -> outcomeOf(second));
    }

    private static List<String> concurrentlyRaw(Callable<String> first, Callable<String> second) throws Exception {
        try (ExecutorService both = Executors.newFixedThreadPool(2)) {
            Future<String> firstOutcome = both.submit(first);
            Future<String> secondOutcome = both.submit(second);
            return List.of(
                    firstOutcome.get(BOUND_SECONDS, TimeUnit.SECONDS),
                    secondOutcome.get(BOUND_SECONDS, TimeUnit.SECONDS));
        }
    }

    private static String outcomeOf(Callable<Boolean> goOffCall) {
        try {
            return goOffCall.call() ? LEFT : STAYED;
        } catch (Exception failure) {
            return sqlStateOf(failure);
        }
    }

    // PostgreSQL picks the deadlock victim, so each side records its own outcome instead of assuming which one fails.
    private static String updateThenCommit(Connection connection, String update) throws SQLException {
        try {
            execute(connection, update);
            connection.commit();
            return COMMITTED;
        } catch (SQLException failure) {
            connection.rollback();
            return failure.getSQLState();
        }
    }

    private static String sqlStateOf(Throwable failure) {
        Throwable root = NestedExceptionUtils.getMostSpecificCause(failure);
        return root instanceof SQLException sql ? sql.getSQLState() : root.toString();
    }

    private static Connection beginSerializable() throws SQLException {
        Connection connection = openConnection();
        connection.setAutoCommit(false);
        connection.setTransactionIsolation(Connection.TRANSACTION_SERIALIZABLE);
        return connection;
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

    @Configuration(proxyBeanMethods = false)
    @EnableTransactionManagement(proxyTargetClass = true)
    @EnableAsync(proxyTargetClass = true)
    static class TwoDataSourcesConfig {

        @Bean
        DataSourceTransactionManager transactionManager() {
            return new DataSourceTransactionManager(newDataSource());
        }

        @Bean
        Q17_03 q17_03(DataSourceTransactionManager transactionManager) {
            JdbcTemplate managed = new JdbcTemplate(transactionManager.getDataSource());
            JdbcTemplate unmanaged = new JdbcTemplate(newDataSource()); // same database, another DataSource
            return new Q17_03(managed, unmanaged);
        }

        @Bean
        Q17_14.Audit q17_14Audit(DataSourceTransactionManager transactionManager) {
            return new Q17_14.Audit(new JdbcTemplate(transactionManager.getDataSource()));
        }

        @Bean
        Q17_14 q17_14(DataSourceTransactionManager transactionManager, Q17_14.Audit audit) {
            return new Q17_14(new JdbcTemplate(transactionManager.getDataSource()), audit);
        }

        @Bean
        CyclicBarrier bothChecked() {
            return new CyclicBarrier(2);
        }

        // Both callers wait here after their check, so both read before either writes.
        @Bean
        Q17_19 q17_19(DataSourceTransactionManager transactionManager, CyclicBarrier bothChecked) {
            JdbcClient jdbc = JdbcClient.create(transactionManager.getDataSource());
            return new Q17_19(jdbc, () -> awaitBoth(bothChecked));
        }

        @Bean(destroyMethod = "close")
        ExecutorService taskExecutor() {
            return Executors.newVirtualThreadPerTaskExecutor();
        }

        @Bean
        Q17_29.Invoices q17_29Invoices(DataSourceTransactionManager transactionManager) {
            return new Q17_29.Invoices(new JdbcTemplate(transactionManager.getDataSource()));
        }

        @Bean
        Q17_29 q17_29(DataSourceTransactionManager transactionManager, Q17_29.Invoices invoices) {
            return new Q17_29(new JdbcTemplate(transactionManager.getDataSource()), invoices);
        }

        private static void awaitBoth(CyclicBarrier barrier) {
            try {
                barrier.await(BOUND_SECONDS, TimeUnit.SECONDS);
            } catch (Exception interruptedOrTimedOut) {
                throw new IllegalStateException(interruptedOrTimedOut);
            }
        }

        private static DataSource newDataSource() {
            return new DriverManagerDataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        }
    }
}
