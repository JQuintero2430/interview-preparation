package dev.interview.persistence.smoke;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

@Tag("docker")
@Testcontainers(disabledWithoutDocker = true)
class PostgresVersionSmokeTest {

    private static final String POSTGRES_IMAGE = "postgres:18.6";
    private static final String VERSION_QUERY = "select version()";
    private static final String EXPECTED_VERSION_PREFIX = "PostgreSQL 18";

    @Container
    private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer(POSTGRES_IMAGE);

    @Test
    void selectVersion_returnsPostgres18_whenContainerIsRunning() throws SQLException {
        String version;
        try (Connection connection = DriverManager.getConnection(
                        POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
                Statement statement = connection.createStatement();
                ResultSet result = statement.executeQuery(VERSION_QUERY)) {
            assertThat(result.next()).isTrue();
            version = result.getString(1);
        }

        assertThat(version).startsWith(EXPECTED_VERSION_PREFIX);
    }
}
