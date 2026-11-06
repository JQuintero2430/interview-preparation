package dev.interview.springtransactions.m17.ex1;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.springtransactions.m17.s03.TxSnapshot;
import dev.interview.springtransactions.m17.support.RecordingTransactionManager;
import java.io.IOException;
import java.lang.reflect.Constructor;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

class TransferRepairTest {

    private static final Path SOURCES = Path.of("src/main/java/dev/interview/springtransactions/m17/ex1");

    private final AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(TxConfig.class);
    private final RecordingTransactionManager transactionManager = context.getBean(RecordingTransactionManager.class);
    private final Ledger ledger = context.getBean(Ledger.class);
    private final List<TxSnapshot> fraudChecks = context.getBean(TxConfig.class).fraudChecks;

    @AfterEach
    void close() {
        context.close();
    }

    @Test
    @DisplayName("Ex17.1 · (1) the posting runs in its own transaction, the fraud check outside it")
    void postingRunsInItsOwnTransaction() {
        context.getBean(TransferService.class).transfer("alice", "bob", 500);

        assertThat(transactionManager.events()).containsExactly("begin tx1", "commit tx1");
        assertThat(ledger.entries()).containsExactly("debit alice 500", "credit bob 500");
        assertThat(fraudChecks).containsExactly(new TxSnapshot(false, null));
    }

    @Test
    @DisplayName("Ex17.1 · (2) a failed credit rolls back the debit")
    void failedCreditRollsBackDebit() {
        ledger.freeze("bob");

        assertThatThrownBy(() -> context.getBean(TransferService.class).transfer("alice", "bob", 500))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("account bob is frozen");
        assertThat(transactionManager.events()).containsExactly("begin tx1", "rollback tx1");
        assertThat(ledger.entries()).isEmpty();
    }

    @Test
    @DisplayName("Ex17.1 · (2) before the fix, a failed credit leaves the debit in the ledger")
    void brokenServiceLeavesDebit() {
        ledger.freeze("bob");

        assertThatThrownBy(() -> context.getBean(dev.interview.springtransactions.m17.ex1.broken.TransferService.class)
                        .transfer("alice", "bob", 500))
                .isInstanceOf(IllegalStateException.class);
        assertThat(transactionManager.events()).isEmpty();
        assertThat(ledger.entries()).containsExactly("debit alice 500");
    }

    @ParameterizedTest
    @ValueSource(classes = {TransferService.class, TransferPosting.class})
    @DisplayName("Ex17.1 · (3) no self-injection and no AopContext in the solution")
    void noSelfInjectionOrAopContext(Class<?> type) throws IOException {
        List<Class<?>> forbidden = List.of(type, ObjectProvider.class, ApplicationContext.class);
        for (Constructor<?> constructor : type.getDeclaredConstructors()) {
            assertThat(constructor.getParameterTypes()).doesNotContainAnyElementsOf(forbidden);
        }
        assertThat(Files.readString(SOURCES.resolve(type.getSimpleName() + ".java")))
                .doesNotContain("AopContext");
    }

    @Configuration(proxyBeanMethods = false)
    @EnableTransactionManagement(proxyTargetClass = true)
    static class TxConfig {

        final List<TxSnapshot> fraudChecks = new CopyOnWriteArrayList<>();

        @Bean
        RecordingTransactionManager transactionManager() {
            return new RecordingTransactionManager();
        }

        @Bean
        Ledger ledger() {
            return new Ledger();
        }

        @Bean
        FraudCheck fraudCheck() {
            return (from, cents) -> fraudChecks.add(TxSnapshot.current());
        }

        @Bean
        TransferPosting transferPosting(Ledger ledger) {
            return new TransferPosting(ledger);
        }

        @Bean
        TransferService transferService(FraudCheck fraudCheck, TransferPosting posting) {
            return new TransferService(fraudCheck, posting);
        }

        // fully qualified: the starting code and the solution share the simple name TransferService
        @Bean
        dev.interview.springtransactions.m17.ex1.broken.TransferService brokenTransferService(
                FraudCheck fraudCheck, Ledger ledger) {
            return new dev.interview.springtransactions.m17.ex1.broken.TransferService(fraudCheck, ledger);
        }
    }
}
