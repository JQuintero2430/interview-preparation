package dev.interview.springtransactions.m17.s03;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.springtransactions.m17.support.RecordingTransactionManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.aop.support.AopUtils;
import org.springframework.beans.factory.NoUniqueBeanDefinitionException;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

class TransactionalProxyTest {

    private final AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(TxConfig.class);
    private final CheckoutService checkout = context.getBean(CheckoutService.class);
    private final RecordingTransactionManager transactionManager = context.getBean(RecordingTransactionManager.class);

    @AfterEach
    void close() {
        context.close();
    }

    @Test
    @DisplayName("M17 §3 · proxied call begins and commits")
    void proxiedCallBeginsAndCommits() {
        TxSnapshot inside = checkout.placeOrder();

        assertThat(AopUtils.isCglibProxy(checkout)).isTrue();
        assertThat(inside)
                .isEqualTo(new TxSnapshot(true, "dev.interview.springtransactions.m17.s03.CheckoutService.placeOrder"));
        assertThat(transactionManager.events()).containsExactly("begin tx1", "commit tx1");
    }

    @Test
    @DisplayName("M17 §3 · isActualTransactionActive inside and outside")
    void activeOnlyInsideAnnotatedMethods() {
        assertThat(TxSnapshot.current().active()).isFalse();
        assertThat(checkout.quote().active()).isFalse();
        assertThat(checkout.placeOrder().active()).isTrue();
        assertThat(TxSnapshot.current().active()).isFalse();
    }

    @Test
    @DisplayName("M17 §3 · jakarta.transaction.Transactional is honoured")
    void jakartaAnnotationIsHonoured() {
        assertThat(checkout.placeOrderWithJakartaAnnotation().active()).isTrue();
        assertThat(transactionManager.events()).containsExactly("begin tx1", "commit tx1");
    }

    @Test
    @DisplayName("M17 §3 · two managers without a qualifier fail at call time, not at startup")
    void twoManagersFailAtCallTime() {
        try (var twoManagers = new AnnotationConfigApplicationContext(TxConfig.class, SecondManagerConfig.class)) {
            CheckoutService service = twoManagers.getBean(CheckoutService.class);

            assertThatThrownBy(service::placeOrder).isInstanceOf(NoUniqueBeanDefinitionException.class);
        }
    }

    @Configuration(proxyBeanMethods = false)
    static class SecondManagerConfig {

        @Bean
        RecordingTransactionManager reportingTransactionManager() {
            return new RecordingTransactionManager();
        }
    }

    @Configuration(proxyBeanMethods = false)
    @EnableTransactionManagement(proxyTargetClass = true)
    static class TxConfig {

        @Bean
        RecordingTransactionManager transactionManager() {
            return new RecordingTransactionManager();
        }

        @Bean
        CheckoutService checkoutService() {
            return new CheckoutService();
        }
    }
}
