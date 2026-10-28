package dev.interview.springtransactions.m17.s05;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.springtransactions.m17.support.RecordingTransactionManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.UnexpectedRollbackException;
import org.springframework.transaction.annotation.EnableTransactionManagement;

class RollbackRulesTest {

    private final AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(TxConfig.class);
    private final PaymentService payments = context.getBean(PaymentService.class);
    private final RecordingTransactionManager transactionManager = context.getBean(RecordingTransactionManager.class);

    @AfterEach
    void close() {
        context.close();
    }

    @Test
    @DisplayName("M17 §5 · checked exception commits")
    void checkedExceptionCommits() {
        assertThatThrownBy(payments::chargeDefault).isInstanceOf(PaymentException.class);

        assertThat(transactionManager.events()).containsExactly("begin tx1", "commit tx1");
    }

    @Test
    @DisplayName("M17 §5 · rollbackFor rolls back")
    void rollbackForRollsBack() {
        assertThatThrownBy(payments::chargeWithRollbackFor).isInstanceOf(PaymentException.class);

        assertThat(transactionManager.events()).containsExactly("begin tx1", "rollback tx1");
    }

    @Test
    @DisplayName("M17 §5 · setRollbackOnly rolls back without an exception")
    void setRollbackOnlyRollsBackQuietly() {
        payments.chargeAndCancel();

        assertThat(transactionManager.events()).containsExactly("begin tx1", "rollback tx1");
    }

    @Test
    @DisplayName("M17 §5 · rollback-only surfaces UnexpectedRollbackException")
    void rollbackOnlySurfacesAtOuterCommit() {
        CheckoutFlow checkout = context.getBean(CheckoutFlow.class);

        assertThatThrownBy(() -> checkout.placeOrder("SKU-1"))
                .isInstanceOf(UnexpectedRollbackException.class)
                .hasMessage("Transaction rolled back because it has been marked as rollback-only");
        assertThat(transactionManager.events()).containsExactly("begin tx1", "set rollback-only tx1", "rollback tx1");
    }

    @Configuration(proxyBeanMethods = false)
    @EnableTransactionManagement(proxyTargetClass = true)
    static class TxConfig {

        @Bean
        RecordingTransactionManager transactionManager() {
            return new RecordingTransactionManager();
        }

        @Bean
        PaymentService paymentService() {
            return new PaymentService();
        }

        @Bean
        InventoryService inventoryService() {
            return new InventoryService();
        }

        @Bean
        CheckoutFlow checkoutFlow(InventoryService inventory) {
            return new CheckoutFlow(inventory);
        }
    }
}
