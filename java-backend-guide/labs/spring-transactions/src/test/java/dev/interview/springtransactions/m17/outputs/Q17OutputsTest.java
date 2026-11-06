package dev.interview.springtransactions.m17.outputs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.springtransactions.m17.s03.TxSnapshot;
import dev.interview.springtransactions.m17.support.RecordingTransactionManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.NoTransactionException;
import org.springframework.transaction.UnexpectedRollbackException;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.transaction.support.TransactionTemplate;

/** Output and Bug hunt questions of module 17 that need only the recording transaction manager (route R1). */
class Q17OutputsTest {

    private static final String BEGIN_TX1 = "begin tx1";
    private static final String COMMIT_TX1 = "commit tx1";
    private static final String PLACE_ORDER_TX_NAME = "dev.interview.springtransactions.m17.outputs.Q17_06.placeOrder";
    private static final String RESERVE_STOCK = "reserveStock";
    private static final String[] REQUIRES_NEW_THROUGH_PROXY = {
        BEGIN_TX1, "suspend tx1", "begin tx2", "commit tx2", "resume tx1", COMMIT_TX1
    };
    private static final String ROLLBACK_TX1 = "rollback tx1";
    private static final String FEED_FAILURE = "supplier feed unreadable";
    private static final String SKU = "SKU-1";
    private static final String ROLLBACK_ONLY_MESSAGE =
            "Transaction rolled back because it has been marked as rollback-only";
    private static final String NO_TX_STATUS_MESSAGE = "No transaction aspect-managed TransactionStatus in scope";
    private static final String PAYMENT_DECLINED = "payment declined";
    private static final String WRITE_AUDIT_TX_NAME = "dev.interview.springtransactions.m17.outputs.Q17_12.writeAudit";

    private final AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(TxConfig.class);
    private final RecordingTransactionManager transactionManager = context.getBean(RecordingTransactionManager.class);

    @AfterEach
    void close() {
        context.close();
    }

    @Test
    @DisplayName("Q17.06 · self-invoked REQUIRES_NEW runs in the caller's transaction")
    void q17_06() {
        String transactionSeenByAudit = context.getBean(Q17_06.class).placeOrder();

        assertThat(transactionSeenByAudit).isEqualTo(PLACE_ORDER_TX_NAME);
        assertThat(transactionManager.events()).containsExactly(BEGIN_TX1, COMMIT_TX1);
    }

    @Test
    @DisplayName("Q17.06 · REQUIRES_NEW through the proxy suspends and begins a new transaction")
    void q17_06_throughProxy() {
        Q17_06 orders = context.getBean(Q17_06.class);

        new TransactionTemplate(transactionManager).executeWithoutResult(status -> orders.writeAudit());

        assertThat(transactionManager.events()).containsExactly(REQUIRES_NEW_THROUGH_PROXY);
    }

    @Test
    @DisplayName("Q17.07 · only the protected method is advised")
    void q17_07() {
        Q17_07 orders = context.getBean(Q17_07.class);

        TxSnapshot reserve = ReflectionTestUtils.invokeMethod(orders, RESERVE_STOCK);
        TxSnapshot charge = orders.chargeCard();
        TxSnapshot ship = orders.shipOrder();

        assertThat(reserve.active()).isFalse();
        assertThat(charge.active()).isFalse();
        assertThat(ship.active()).isTrue();
        assertThat(transactionManager.events()).containsExactly(BEGIN_TX1, COMMIT_TX1);
    }

    @Test
    @DisplayName("Q17.09 · a checked exception commits")
    void q17_09() {
        Q17_09 importer = context.getBean(Q17_09.class);

        assertThatThrownBy(importer::importPrices)
                .isInstanceOf(Q17_09.FeedException.class)
                .hasMessage(FEED_FAILURE);
        assertThat(transactionManager.events()).containsExactly(BEGIN_TX1, COMMIT_TX1);
    }

    @Test
    @DisplayName("Q17.09 · rollbackFor turns the same exception into a rollback")
    void q17_09_rollbackFor() {
        Q17_09 importer = context.getBean(Q17_09.class);

        assertThatThrownBy(importer::importPricesRollingBack)
                .isInstanceOf(Q17_09.FeedException.class)
                .hasMessage(FEED_FAILURE);
        assertThat(transactionManager.events()).containsExactly(BEGIN_TX1, ROLLBACK_TX1);
    }

    @Test
    @DisplayName("Q17.10 · the caught inner failure still rolls back, with UnexpectedRollbackException")
    void q17_10() {
        Q17_10 orders = context.getBean(Q17_10.class);

        assertThatThrownBy(() -> orders.placeOrder(SKU))
                .isInstanceOf(UnexpectedRollbackException.class)
                .hasMessage(ROLLBACK_ONLY_MESSAGE);
        assertThat(transactionManager.events()).containsExactly(BEGIN_TX1, "set rollback-only tx1", ROLLBACK_TX1);
    }

    @Test
    @DisplayName("Q17.10 · with globalRollbackOnParticipationFailure=false the caller decides and commits")
    void q17_10_callerDecides() {
        transactionManager.setGlobalRollbackOnParticipationFailure(false);

        String outcome = context.getBean(Q17_10.class).placeOrder(SKU);

        assertThat(outcome).isEqualTo("backordered");
        assertThat(transactionManager.events()).containsExactly(BEGIN_TX1, COMMIT_TX1);
    }

    @Test
    @DisplayName("Q17.11 · inside a real transaction both flags are true")
    void q17_11_required() {
        Q17_11.Probe probe = context.getBean(Q17_11.class).required();

        assertThat(probe).isEqualTo(new Q17_11.Probe(true, true));
        assertThat(transactionManager.events()).containsExactly(BEGIN_TX1, COMMIT_TX1);
    }

    @Test
    @DisplayName("Q17.11 · SUPPORTS without a caller: synchronization active, no actual transaction")
    void q17_11_supports() {
        Q17_11.Probe probe = context.getBean(Q17_11.class).supports();

        assertThat(probe).isEqualTo(new Q17_11.Probe(false, true));
        assertThat(transactionManager.events()).isEmpty();
    }

    @Test
    @DisplayName("Q17.11 · currentTransactionStatus outside an advised method throws")
    void q17_11_currentStatusOutside() {
        assertThatThrownBy(TransactionAspectSupport::currentTransactionStatus)
                .isInstanceOf(NoTransactionException.class)
                .hasMessage(NO_TX_STATUS_MESSAGE);
    }

    @Test
    @DisplayName("Q17.12 · self-injection through ObjectProvider reaches the proxy")
    void q17_12_selfInjection() {
        String transactionSeenByAudit = context.getBean(Q17_12.class).placeOrderViaSelf();

        assertThat(transactionSeenByAudit).isEqualTo(WRITE_AUDIT_TX_NAME);
        assertThat(transactionManager.events()).containsExactly(REQUIRES_NEW_THROUGH_PROXY);
    }

    @Test
    @DisplayName("Q17.12 · a REQUIRES_NEW TransactionTemplate draws the boundary inside the method")
    void q17_12_template() {
        String transactionSeenByAudit = context.getBean(Q17_12.class).placeOrderViaTemplate();

        assertThat(transactionSeenByAudit).isEqualTo("audit");
        assertThat(transactionManager.events()).containsExactly(REQUIRES_NEW_THROUGH_PROXY);
    }

    @Test
    @DisplayName("Q17.27 · AFTER_COMMIT runs only after a commit; fallbackExecution also runs without a transaction")
    void q17_27() {
        Q17_27 orders = context.getBean(Q17_27.class);
        Q17_27.Listeners listeners = context.getBean(Q17_27.Listeners.class);

        orders.place("A");
        assertThatThrownBy(() -> orders.placeThenFail("B"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage(PAYMENT_DECLINED);
        orders.placeWithoutTransaction("C");

        assertThat(listeners.confirmed()).containsExactly("A");
        assertThat(listeners.audited()).containsExactly("A", "C");
        assertThat(transactionManager.events()).containsExactly(BEGIN_TX1, COMMIT_TX1, "begin tx2", "rollback tx2");
    }

    @Configuration(proxyBeanMethods = false)
    @EnableTransactionManagement(proxyTargetClass = true)
    static class TxConfig {

        @Bean
        RecordingTransactionManager transactionManager() {
            return new RecordingTransactionManager();
        }

        @Bean
        Q17_06 q17_06() {
            return new Q17_06();
        }

        @Bean
        Q17_07 q17_07() {
            return new Q17_07();
        }

        @Bean
        Q17_09 q17_09() {
            return new Q17_09();
        }

        @Bean
        Q17_10.Inventory q17_10Inventory() {
            return new Q17_10.Inventory();
        }

        @Bean
        Q17_10 q17_10(Q17_10.Inventory inventory) {
            return new Q17_10(inventory);
        }

        @Bean
        Q17_11 q17_11() {
            return new Q17_11();
        }

        @Bean
        Q17_12 q17_12(ObjectProvider<Q17_12> self, RecordingTransactionManager transactionManager) {
            return new Q17_12(self, transactionManager);
        }

        @Bean
        Q17_27.Listeners q17_27Listeners() {
            return new Q17_27.Listeners();
        }

        @Bean
        Q17_27 q17_27(ApplicationEventPublisher events) {
            return new Q17_27(events);
        }
    }
}
