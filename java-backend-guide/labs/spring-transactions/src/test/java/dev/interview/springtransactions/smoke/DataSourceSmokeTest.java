package dev.interview.springtransactions.smoke;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

@SpringBootTest
@Tag("docker")
@Testcontainers(disabledWithoutDocker = true)
class DataSourceSmokeTest {

    private static final String POSTGRES_IMAGE = "postgres:18.6";

    private static final String EXPECTED_PRODUCT_NAME = "PostgreSQL";

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer(POSTGRES_IMAGE);

    @Autowired
    private DataSource dataSource;

    @Test
    void getDatabaseProductName_returnsPostgreSql_whenContainerIsConnected() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            String productName = connection.getMetaData().getDatabaseProductName();

            assertThat(productName).isEqualTo(EXPECTED_PRODUCT_NAME);
        }
    }
}
