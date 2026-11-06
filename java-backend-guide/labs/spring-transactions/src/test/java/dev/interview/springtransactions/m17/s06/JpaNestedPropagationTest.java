package dev.interview.springtransactions.m17.s06;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.springtransactions.m17.support.PostgresTestBase;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.NestedTransactionNotSupportedException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

@SpringBootTest
class JpaNestedPropagationTest extends PostgresTestBase {

    private static final String NOT_ALLOWED_BY_DEFAULT =
            "Transaction manager does not allow nested transactions by default";
    private static final String NO_SAVEPOINT_SUPPORT =
            "JpaDialect does not support savepoints - check your JPA provider's capabilities";

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @Test
    @DisplayName("M17 §6 · JpaTransactionManager rejects NESTED by default")
    void bootJpaTransactionManagerRejectsNested() {
        assertThat(transactionManager).isInstanceOf(JpaTransactionManager.class);

        assertThatThrownBy(() -> runNestedInsideOuter(transactionManager))
                .isInstanceOf(NestedTransactionNotSupportedException.class)
                .hasMessageStartingWith(NOT_ALLOWED_BY_DEFAULT);
    }

    @Test
    @DisplayName("M17 §6 · NESTED with Hibernate has no savepoint support even when allowed")
    void hibernateHasNoSavepointSupportEvenWhenAllowed() {
        JpaTransactionManager nestedAllowed = new JpaTransactionManager(entityManagerFactory);
        nestedAllowed.setNestedTransactionAllowed(true);

        assertThatThrownBy(() -> runNestedInsideOuter(nestedAllowed))
                .isInstanceOf(NestedTransactionNotSupportedException.class)
                .hasMessage(NO_SAVEPOINT_SUPPORT);
    }

    private static void runNestedInsideOuter(PlatformTransactionManager manager) {
        TransactionTemplate outer = new TransactionTemplate(manager);
        TransactionTemplate nested = new TransactionTemplate(manager);
        nested.setPropagationBehavior(TransactionDefinition.PROPAGATION_NESTED);
        outer.executeWithoutResult(status -> nested.executeWithoutResult(inner -> {}));
    }
}
