package dev.interview.springtransactions.m17.outputs;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.springtransactions.m17.support.PostgresTestBase;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

/** Output questions of module 17 that need JPA on PostgreSQL (route R2). */
@SpringBootTest
@Import(Q17_21.class)
class Q17JpaOutputsTest extends PostgresTestBase {

    private static final long PRODUCT_ID = 1;
    private static final String CREATE_PRODUCT = "create table if not exists product (id bigint primary key,"
            + " name text not null unique, price numeric(10, 2) not null check (price >= 0))";
    private static final String TRUNCATE_PRODUCT = "truncate product";
    private static final String SEED_PRODUCT = "insert into product values (1, 'a', 10)";
    private static final String COUNT_AT_TEN = "select count(*) from product where id = 1 and price = 10";

    @Autowired
    private Q17_21 catalog;

    @BeforeAll
    static void createProductTable() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(CREATE_PRODUCT);
        }
    }

    @BeforeEach
    void seed() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(TRUNCATE_PRODUCT);
            statement.execute(SEED_PRODUCT);
        }
    }

    @Test
    @DisplayName("Q17.21 · the change inside readOnly is visible in memory but never written")
    void q17_21() throws SQLException {
        BigDecimal priceSeenInside = catalog.doublePrice(PRODUCT_ID);

        assertThat(priceSeenInside).isEqualByComparingTo("20");
        try (Connection connection = openConnection()) {
            assertThat(countRows(connection, COUNT_AT_TEN)).isEqualTo(1);
        }
    }
}
