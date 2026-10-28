package dev.interview.springtransactions.m17.s11;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.springtransactions.m17.support.RecordingTransactionManager;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

class TransactionalEventsTest {

    @Test
    @DisplayName("M17 §11 · AFTER_COMMIT listener runs after the commit")
    void afterCommitRunsAfterCommit() {
        try (var context = new AnnotationConfigApplicationContext(TxConfig.class)) {
            context.getBean(OrderService.class).place("A-1");

            assertThat(context.getBean(ConfirmationSender.class).sent()).containsExactly("A-1");
        }
    }

    @Test
    @DisplayName("M17 §11 · AFTER_COMMIT listener not called on rollback")
    void afterCommitSkippedOnRollback() {
        try (var context = new AnnotationConfigApplicationContext(TxConfig.class)) {
            OrderService orders = context.getBean(OrderService.class);

            assertThatThrownBy(() -> orders.placeThenFail("A-2")).isInstanceOf(IllegalStateException.class);
            assertThat(context.getBean(ConfirmationSender.class).sent()).isEmpty();
        }
    }

    @Test
    @DisplayName("M17 §11 · no transaction and no fallbackExecution: listener not called")
    void noTransactionNoListener() {
        try (var context = new AnnotationConfigApplicationContext(TxConfig.class)) {
            context.getBean(OrderService.class).placeWithoutTransaction("A-3");

            assertThat(context.getBean(ConfirmationSender.class).sent()).isEmpty();
        }
    }

    @Test
    @DisplayName("M17 §11 · an AFTER_COMMIT listener's exception is logged, not thrown to the caller")
    void listenerExceptionIsSwallowed() {
        try (var context = new AnnotationConfigApplicationContext(TxConfig.class, FailingListenerConfig.class)) {
            OrderService orders = context.getBean(OrderService.class);

            assertThatCode(() -> orders.place("A-4")).doesNotThrowAnyException();
        }
    }

    @Test
    @DisplayName("M17 §11 · REQUIRED write inside AFTER_COMMIT joins the finished transaction")
    void requiredWriteJoinsFinishedTransaction() {
        try (var context = new AnnotationConfigApplicationContext(TxConfig.class, AuditConfig.class)) {
            context.getBean(OrderService.class).place("A-5");

            assertThat(context.getBean(AuditWriter.class).log()).containsExactly("REQUIRED", "REQUIRES_NEW");
            assertThat(context.getBean(RecordingTransactionManager.class).events())
                    .containsExactly("begin tx1", "commit tx1", "suspend tx1", "begin tx2", "commit tx2", "resume tx1");
        }
    }

    @Test
    @DisplayName("M17 §11 · a @Transactional(REQUIRED) listener method is rejected at startup")
    void transactionalListenerRejected() {
        assertThatThrownBy(() -> new AnnotationConfigApplicationContext(TxConfig.class, BadListenerConfig.class))
                .hasStackTraceContaining(
                        "@TransactionalEventListener method must not be annotated with @Transactional");
    }

    @Configuration(proxyBeanMethods = false)
    @EnableTransactionManagement(proxyTargetClass = true)
    static class TxConfig {

        @Bean
        RecordingTransactionManager transactionManager() {
            return new RecordingTransactionManager();
        }

        @Bean
        OrderService orderService(ApplicationEventPublisher events) {
            return new OrderService(events);
        }

        @Bean
        ConfirmationSender confirmationSender() {
            return new ConfirmationSender();
        }
    }

    static class FailingListener {

        @TransactionalEventListener
        void onOrderPlaced(OrderPlaced event) {
            throw new IllegalStateException("mail server down");
        }
    }

    @Configuration(proxyBeanMethods = false)
    static class FailingListenerConfig {

        @Bean
        FailingListener failingListener() {
            return new FailingListener();
        }
    }

    static class AuditWriter {

        private final List<String> log = new ArrayList<>();

        @Transactional
        public void write() {
            log.add("REQUIRED");
        }

        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public void writeInNewTransaction() {
            log.add("REQUIRES_NEW");
        }

        List<String> log() {
            return log;
        }
    }

    static class AuditListener {

        private final AuditWriter writer;

        AuditListener(AuditWriter writer) {
            this.writer = writer;
        }

        @TransactionalEventListener
        void onOrderPlaced(OrderPlaced event) {
            writer.write();
            writer.writeInNewTransaction();
        }
    }

    @Configuration(proxyBeanMethods = false)
    static class AuditConfig {

        @Bean
        AuditWriter auditWriter() {
            return new AuditWriter();
        }

        @Bean
        AuditListener auditListener(AuditWriter writer) {
            return new AuditListener(writer);
        }
    }

    static class BadListener {

        @Transactional
        @TransactionalEventListener
        public void onOrderPlaced(OrderPlaced event) {}
    }

    @Configuration(proxyBeanMethods = false)
    static class BadListenerConfig {

        @Bean
        BadListener badListener() {
            return new BadListener();
        }
    }
}
