package dev.interview.springtransactions.m17.s09;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.springtransactions.m17.s08.Product;
import dev.interview.springtransactions.m17.support.PostgresTestBase;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
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
class PersistenceContextTest extends PostgresTestBase {

    private static final long PRODUCT_ID = 1;
    private static final long MISSING_ID = 99;
    private static final String CREATE_PRODUCT = "create table if not exists product (id bigint primary key,"
            + " name text not null unique, price numeric(10, 2) not null check (price >= 0))";
    private static final String TRUNCATE_PRODUCT = "truncate product";
    private static final String SEED_PRODUCT = "insert into product values (1, 'a', 10)";
    private static final String COUNT_AT_TWENTY = "select count(*) from product where id = 1 and price = 20";
    private static final String JPQL_COUNT_AT_PRICE = "select count(p) from Product p where p.price = :price";
    private static final BigDecimal TWENTY = new BigDecimal("20");

    @Autowired
    private Repricing repricing;

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
    @DisplayName("M17 §9 · managed entity change is flushed at commit without save()")
    void reprice_writesChange_whenNoSaveCalled() throws SQLException {
        repricing.reprice(PRODUCT_ID, TWENTY);

        assertThat(countAtTwenty()).isEqualTo(1);
    }

    @Test
    @DisplayName("M17 §9 · AUTO flush makes a pending change visible to a JPQL query")
    void jpqlQuery_seesPendingChange_whenFlushModeAuto() throws SQLException {
        TransactionTemplate template = new TransactionTemplate(transactionManager);

        Long seenAtTwenty = template.execute(status -> {
            entityManager.find(Product.class, PRODUCT_ID).setPrice(TWENTY);
            Long count = entityManager
                    .createQuery(JPQL_COUNT_AT_PRICE, Long.class)
                    .setParameter("price", TWENTY)
                    .getSingleResult();
            status.setRollbackOnly();
            return count;
        });

        assertThat(seenAtTwenty).isEqualTo(1);
        assertThat(countAtTwenty()).isZero();
    }

    @Test
    @DisplayName("M17 §9 · one transaction returns the same instance for the same id")
    void find_returnsSameInstance_whenSameTransaction() {
        TransactionTemplate template = new TransactionTemplate(transactionManager);

        Boolean same = template.execute(status ->
                entityManager.find(Product.class, PRODUCT_ID) == entityManager.find(Product.class, PRODUCT_ID));

        assertThat(same).isTrue();
    }

    @Test
    @DisplayName("M17 §9 · entity loaded without a transaction is detached and never written")
    void detachedEntity_isNotWritten_whenLoadedWithoutTransaction() throws SQLException {
        Product product = entityManager.find(Product.class, PRODUCT_ID);
        product.setPrice(TWENTY);
        TransactionTemplate template = new TransactionTemplate(transactionManager);

        Boolean managed = template.execute(status -> entityManager.contains(product));

        assertThat(managed).isFalse();
        assertThat(countAtTwenty()).isZero();
    }

    @Test
    @DisplayName("M17 §9 · reprice of a missing id throws EntityNotFoundException")
    void reprice_throwsEntityNotFound_whenIdMissing() {
        assertThatThrownBy(() -> repricing.reprice(MISSING_ID, TWENTY))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessage("product " + MISSING_ID);
    }

    private static long countAtTwenty() throws SQLException {
        try (Connection connection = openConnection()) {
            return countRows(connection, COUNT_AT_TWENTY);
        }
    }
}
