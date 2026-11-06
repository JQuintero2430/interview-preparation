package dev.interview.springtransactions.m17.s06;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.springtransactions.m17.support.RecordingTransactionManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.IllegalTransactionStateException;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.TransactionTemplate;

class PropagationDecisionsTest {

    private static final String NO_EXISTING_TRANSACTION =
            "No existing transaction found for transaction marked with propagation 'mandatory'";
    private static final String EXISTING_TRANSACTION =
            "Existing transaction found for transaction marked with propagation 'never'";

    private final AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(TxConfig.class);
    private final PropagationSteps steps = context.getBean(PropagationSteps.class);
    private final RecordingTransactionManager transactionManager = context.getBean(RecordingTransactionManager.class);
    private final TransactionTemplate outer = new TransactionTemplate(transactionManager);

    @AfterEach
    void close() {
        context.close();
    }

    @Test
    @DisplayName("M17 §6 · REQUIRED joins the outer transaction")
    void requiredJoinsOuter() {
        outer.executeWithoutResult(status -> steps.required());

        assertThat(transactionManager.events()).containsExactly("begin tx1", "commit tx1");
    }

    @Test
    @DisplayName("M17 §6 · SUPPORTS without a transaction runs without one")
    void supportsWithoutTransactionRunsWithout() {
        steps.supports();

        assertThat(transactionManager.events()).isEmpty();
    }

    @Test
    @DisplayName("M17 §6 · SUPPORTS inside a transaction joins it")
    void supportsInsideTransactionJoins() {
        outer.executeWithoutResult(status -> steps.supports());

        assertThat(transactionManager.events()).containsExactly("begin tx1", "commit tx1");
    }

    @Test
    @DisplayName("M17 §6 · MANDATORY without transaction throws")
    void mandatoryWithoutTransactionThrows() {
        assertThatThrownBy(steps::mandatory)
                .isInstanceOf(IllegalTransactionStateException.class)
                .hasMessage(NO_EXISTING_TRANSACTION);
        assertThat(transactionManager.events()).isEmpty();
    }

    @Test
    @DisplayName("M17 §6 · REQUIRES_NEW suspends outer")
    void requiresNewSuspendsOuter() {
        outer.executeWithoutResult(status -> steps.requiresNew());

        assertThat(transactionManager.events())
                .containsExactly("begin tx1", "suspend tx1", "begin tx2", "commit tx2", "resume tx1", "commit tx1");
    }

    @Test
    @DisplayName("M17 §6 · NOT_SUPPORTED suspends outer without starting a transaction")
    void notSupportedSuspendsWithoutNewTransaction() {
        outer.executeWithoutResult(status -> steps.notSupported());

        assertThat(transactionManager.events()).containsExactly("begin tx1", "suspend tx1", "resume tx1", "commit tx1");
    }

    @Test
    @DisplayName("M17 §6 · NEVER inside a transaction throws and the outer rolls back")
    void neverInsideTransactionThrows() {
        assertThatThrownBy(() -> outer.executeWithoutResult(status -> steps.never()))
                .isInstanceOf(IllegalTransactionStateException.class)
                .hasMessage(EXISTING_TRANSACTION);
        assertThat(transactionManager.events()).containsExactly("begin tx1", "rollback tx1");
    }

    @Test
    @DisplayName("M17 §6 · NESTED creates savepoint")
    void nestedCreatesSavepoint() {
        outer.executeWithoutResult(status -> steps.nested());

        assertThat(transactionManager.events())
                .containsExactly("begin tx1", "savepoint sp1", "release sp1", "commit tx1");
    }

    @Test
    @DisplayName("M17 §6 · NESTED failure rolls back to the savepoint and the outer commits")
    void nestedFailureRollsBackToSavepoint() {
        outer.executeWithoutResult(status -> {
            try {
                steps.nestedFailing();
            } catch (IllegalStateException expected) {
                // The outer unit of work chooses to continue without the optional inner step: that is what NESTED
                // allows and what a joined REQUIRED call would not (it would mark the whole transaction).
            }
        });

        assertThat(transactionManager.events())
                .containsExactly("begin tx1", "savepoint sp1", "rollback to sp1", "release sp1", "commit tx1");
    }

    @Configuration(proxyBeanMethods = false)
    @EnableTransactionManagement(proxyTargetClass = true)
    static class TxConfig {

        @Bean
        RecordingTransactionManager transactionManager() {
            return new RecordingTransactionManager();
        }

        @Bean
        PropagationSteps propagationSteps() {
            return new PropagationSteps();
        }
    }
}
