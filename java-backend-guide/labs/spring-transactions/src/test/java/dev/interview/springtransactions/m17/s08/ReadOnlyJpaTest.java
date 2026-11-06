package dev.interview.springtransactions.m17.s08;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.springtransactions.m17.support.PostgresTestBase;
import jakarta.persistence.EntityManager;
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
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@SpringBootTest
class ReadOnlyJpaTest extends PostgresTestBase {

    private static final long PRODUCT_ID = 1;
    private static final String CREATE_PRODUCT = "create table if not exists product (id bigint primary key,"
            + " name text not null unique, price numeric(10, 2) not null check (price >= 0))";
    private static final String TRUNCATE_PRODUCT = "truncate product";
    private static final String SEED_PRODUCT = "insert into product values (1, 'a', 10)";
    private static final String COUNT_AT_TEN = "select count(*) from product where id = 1 and price = 10";
    private static final String SHOW_READ_ONLY = "show transaction_read_only";
    private static final String ON = "on";
    private static final BigDecimal TWENTY = new BigDecimal("20");

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Autowired
    private EntityManager entityManager;

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
    @DisplayName("M17 §8 · readOnly skips flush of a dirty entity")
    void readOnly_doesNotWriteChange_whenManagedEntityModified() throws SQLException {
        TransactionTemplate readOnly = template(true);

        readOnly.executeWithoutResult(
                status -> entityManager.find(Product.class, PRODUCT_ID).setPrice(TWENTY));

        assertThat(countAtTen()).isEqualTo(1);
    }

    @Test
    @DisplayName("M17 §8 · readOnly entity is not written even by an explicit flush")
    void readOnly_doesNotWriteChange_whenFlushedExplicitly() throws SQLException {
        TransactionTemplate readOnly = template(true);

        readOnly.executeWithoutResult(status -> {
            entityManager.find(Product.class, PRODUCT_ID).setPrice(TWENTY);
            entityManager.flush();
        });

        assertThat(countAtTen()).isEqualTo(1);
    }

    @Test
    @DisplayName("M17 §8 · without readOnly the same change is written at commit")
    void readWrite_writesChange_whenManagedEntityModified() throws SQLException {
        TransactionTemplate readWrite = template(false);

        readWrite.executeWithoutResult(
                status -> entityManager.find(Product.class, PRODUCT_ID).setPrice(TWENTY));

        assertThat(countAtTen()).isZero();
    }

    @Test
    @DisplayName("M17 §8 · readOnly reaches the connection under JPA too")
    void readOnly_startsReadOnlyTransaction_whenJpaTransactionManager() {
        TransactionTemplate readOnly = template(true);

        Object readOnlyFlag = readOnly.execute(
                status -> entityManager.createNativeQuery(SHOW_READ_ONLY).getSingleResult());

        assertThat(readOnlyFlag).isEqualTo(ON);
    }

    private TransactionTemplate template(boolean readOnly) {
        TransactionTemplate template = new TransactionTemplate(transactionManager);
        template.setReadOnly(readOnly);
        return template;
    }

    private static long countAtTen() throws SQLException {
        try (Connection connection = openConnection()) {
            return countRows(connection, COUNT_AT_TEN);
        }
    }
}
