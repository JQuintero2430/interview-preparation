package dev.interview.springtransactions.m17.s12;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.springtransactions.m17.s02.ManualTransactionRunner;
import dev.interview.springtransactions.m17.s03.TxSnapshot;
import dev.interview.springtransactions.m17.support.RecordingTransactionManager;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.EnableTransactionManagement;

class TransactionsAcrossThreadsTest {

    @Test
    @DisplayName("M17 §12 · work on another thread sees no active transaction")
    void otherThreadsSeeNoTransaction() {
        ManualTransactionRunner runner = new ManualTransactionRunner(new RecordingTransactionManager());
        try (ExecutorService virtualThreads = Executors.newVirtualThreadPerTaskExecutor();
                ExecutorService platformThreads = Executors.newFixedThreadPool(1)) {

            List<TxSnapshot> seen = runner.inTransaction(
                    TransactionDefinition.withDefaults(),
                    () -> List.of(
                            TxSnapshot.current(),
                            CompletableFuture.supplyAsync(TxSnapshot::current, virtualThreads)
                                    .join(),
                            CompletableFuture.supplyAsync(TxSnapshot::current, platformThreads)
                                    .join()));

            assertThat(seen).extracting(TxSnapshot::active).containsExactly(true, false, false);
        }
    }

    @RepeatedTest(10)
    @DisplayName("M17 §12 · an @Async @Transactional method runs in its own transaction on the executor thread")
    void asyncMethodGetsItsOwnTransaction() {
        try (var context = new AnnotationConfigApplicationContext(AsyncConfig.class)) {
            TxSnapshot invoice =
                    context.getBean(AsyncCheckoutService.class).placeOrder().join();

            assertThat(invoice)
                    .isEqualTo(new TxSnapshot(
                            true, "dev.interview.springtransactions.m17.s12.InvoiceService.renderInvoice"));
            // the two transactions may interleave in any order; only the per-transaction order is fixed
            List<String> events =
                    context.getBean(RecordingTransactionManager.class).events();
            assertThat(events).containsExactlyInAnyOrder("begin tx1", "commit tx1", "begin tx2", "commit tx2");
            assertThat(events.indexOf("begin tx2")).isLessThan(events.indexOf("commit tx2"));
            assertThat(events).doesNotContain("suspend tx1");
        }
    }

    @Configuration(proxyBeanMethods = false)
    @EnableTransactionManagement(proxyTargetClass = true)
    @EnableAsync(proxyTargetClass = true)
    static class AsyncConfig {

        @Bean
        RecordingTransactionManager transactionManager() {
            return new RecordingTransactionManager();
        }

        @Bean(destroyMethod = "close")
        ExecutorService taskExecutor() {
            return Executors.newVirtualThreadPerTaskExecutor();
        }

        @Bean
        InvoiceService invoiceService() {
            return new InvoiceService();
        }

        @Bean
        AsyncCheckoutService asyncCheckoutService(InvoiceService invoices) {
            return new AsyncCheckoutService(invoices);
        }
    }
}
