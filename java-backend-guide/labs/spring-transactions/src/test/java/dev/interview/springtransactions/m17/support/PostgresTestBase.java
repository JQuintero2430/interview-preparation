package dev.interview.springtransactions.m17.support;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import org.junit.jupiter.api.Tag;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

/** Route R2 of the M17 plan: a real PostgreSQL 18 with the module schema, plus plain JDBC helpers. */
// Each test class starts its own container on a new port, so a Spring test context cached from an earlier class
// would point at a stopped database; closing the context after each class costs one context start per class.
@DirtiesContext
@Tag("docker")
@Testcontainers(disabledWithoutDocker = true)
public abstract class PostgresTestBase {

    @Container
    @ServiceConnection
    protected static final PostgreSQLContainer POSTGRES =
            new PostgreSQLContainer("postgres:18.6").withInitScript("m17/schema.sql");

    /** A plain JDBC connection straight from the driver, not from a pool. */
    protected static Connection openConnection() throws SQLException {
        return DriverManager.getConnection(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
    }

    protected static long countRows(Connection connection, String countQuery) throws SQLException {
        try (Statement statement = connection.createStatement();
                ResultSet rows = statement.executeQuery(countQuery)) {
            rows.next();
            return rows.getLong(1);
        }
    }

    protected static void truncateAll() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute("truncate order_line, orders");
        }
    }
}
