package dev.interview.springtransactions.m17.s07;

import static org.assertj.core.api.Assertions.assertThat;

import com.zaxxer.hikari.HikariDataSource;
import dev.interview.springtransactions.m17.support.PostgresTestBase;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import javax.sql.DataSource;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

class OnCallRosterTest extends PostgresTestBase {

    private static final int POOL_SIZE = 2;
    private static final long SHIFT = 1;
    private static final String ANA = "ana";
    private static final String BEN = "ben";
    private static final String UNKNOWN_DOCTOR = "cai";
    private static final String CREATE_ON_CALL = "create table if not exists on_call"
            + " (shift_id bigint, doctor text, on_call boolean not null, primary key (shift_id, doctor))";
    private static final String TRUNCATE_ON_CALL = "truncate on_call";
    private static final String SEED_ON_CALL = "insert into on_call values (1, 'ana', true), (1, 'ben', true)";
    private static final String COUNT_ON_CALL = "select count(*) from on_call where on_call = true";
    private static final String COUNT_BEN_ON_CALL =
            "select count(*) from on_call where on_call = true and doctor = 'ben'";
    private static final String SHOW_ISOLATION = "show transaction_isolation";
    private static final String READ_COMMITTED = "read committed";
    private static final String SERIALIZABLE = "serializable";
    private static final String READ_UNCOMMITTED = "read uncommitted";

    private AnnotationConfigApplicationContext context;

    @BeforeAll
    static void createOnCallTable() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(CREATE_ON_CALL);
        }
    }

    @BeforeEach
    void seedAndStartContext() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(TRUNCATE_ON_CALL);
            statement.execute(SEED_ON_CALL);
        }
        context = new AnnotationConfigApplicationContext(TxConfig.class);
    }

    @AfterEach
    void closeContext() {
        context.close();
    }

    @Test
    @DisplayName("M17 §7 · goOffCall lets one of two on-call doctors leave, not both")
    void goOffCall_keepsOneDoctorOnCall_whenBothTryToLeaveInTurn() throws SQLException {
        OnCallRoster roster = context.getBean(OnCallRoster.class);

        boolean anaLeft = roster.goOffCall(SHIFT, ANA);
        boolean benLeft = roster.goOffCall(SHIFT, BEN);

        assertThat(anaLeft).isTrue();
        assertThat(benLeft).isFalse();
        try (Connection connection = openConnection()) {
            assertThat(countRows(connection, COUNT_ON_CALL)).isEqualTo(1);
            assertThat(countRows(connection, COUNT_BEN_ON_CALL)).isEqualTo(1);
        }
    }

    @Test
    @DisplayName("M17 §7 · goOffCall refuses a doctor who is not on the shift")
    void goOffCall_returnsFalse_whenDoctorNotOnShift() throws SQLException {
        OnCallRoster roster = context.getBean(OnCallRoster.class);

        boolean left = roster.goOffCall(SHIFT, UNKNOWN_DOCTOR);

        assertThat(left).isFalse();
        try (Connection connection = openConnection()) {
            assertThat(countRows(connection, COUNT_ON_CALL)).isEqualTo(2);
        }
    }

    @Test
    @DisplayName("M17 §7 · isolation= reaches the PostgreSQL connection")
    void transactional_setsConnectionIsolation_whenIsolationAttributeGiven() {
        IsolationProbe probe = context.getBean(IsolationProbe.class);

        String defaultLevel = probe.defaultLevel();
        String serializableLevel = probe.serializableLevel();
        String readUncommittedLevel = probe.readUncommittedLevel();

        assertThat(defaultLevel).isEqualTo(READ_COMMITTED);
        assertThat(serializableLevel).isEqualTo(SERIALIZABLE);
        assertThat(readUncommittedLevel).isEqualTo(READ_UNCOMMITTED);
    }

    static class IsolationProbe {

        private final JdbcClient jdbc;

        IsolationProbe(JdbcClient jdbc) {
            this.jdbc = jdbc;
        }

        @Transactional(isolation = Isolation.DEFAULT)
        public String defaultLevel() {
            return currentLevel();
        }

        @Transactional(isolation = Isolation.SERIALIZABLE)
        public String serializableLevel() {
            return currentLevel();
        }

        @Transactional(isolation = Isolation.READ_UNCOMMITTED)
        public String readUncommittedLevel() {
            return currentLevel();
        }

        private String currentLevel() {
            return jdbc.sql(SHOW_ISOLATION).query(String.class).single();
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
        OnCallRoster onCallRoster(JdbcClient jdbc) {
            return new OnCallRoster(jdbc);
        }

        @Bean
        IsolationProbe isolationProbe(JdbcClient jdbc) {
            return new IsolationProbe(jdbc);
        }
    }
}
