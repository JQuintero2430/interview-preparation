package dev.interview.springtransactions.m17.s04;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.springtransactions.m17.s03.TxSnapshot;
import dev.interview.springtransactions.m17.support.RecordingTransactionManager;
import java.time.Clock;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.EnableTransactionManagement;

class SilentNoTransactionTest {

    private final AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(TxConfig.class);
    private final OrderWorkflow workflow = context.getBean(OrderWorkflow.class);
    private final RecordingTransactionManager transactionManager = context.getBean(RecordingTransactionManager.class);

    @AfterEach
    void close() {
        context.close();
    }

    @Test
    @DisplayName("M17 §4 · public method through the proxy is advised (control)")
    void publicMethodIsAdvised() {
        assertThat(workflow.saveOrder().active()).isTrue();
    }

    @Test
    @DisplayName("M17 §4 · self-invocation runs without a transaction")
    void selfInvocation() {
        assertThat(workflow.placeOrder().active()).isFalse();
        assertThat(transactionManager.events()).isEmpty();
    }

    @Test
    @DisplayName("M17 §4 · protected method on class proxy is advised")
    void protectedMethodIsAdvised() {
        assertThat(workflow.saveProtected().active()).isTrue();
    }

    @Test
    @DisplayName("M17 §4 · private method is not advised")
    void privateMethodIsNotAdvised() {
        TxSnapshot snapshot = ReflectionTestUtils.invokeMethod(workflow, "savePrivate");

        assertThat(snapshot.active()).isFalse();
    }

    @Test
    @DisplayName("M17 §4 · final method is not advised")
    void finalMethodIsNotAdvised() {
        assertThat(workflow.saveFinal().active()).isFalse();
        assertThat(transactionManager.events()).isEmpty();
    }

    @Test
    @DisplayName("M17 §4 · final method runs on the proxy instance, whose fields are null")
    void finalMethodSeesNullFields() {
        assertThatThrownBy(workflow::stampFinal).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("M17 §4 · static method is not advised")
    void staticMethodIsNotAdvised() {
        assertThat(OrderWorkflow.saveStatic().active()).isFalse();
    }

    @Test
    @DisplayName("M17 §4 · object created with new is not advised")
    void newObjectIsNotAdvised() {
        assertThat(new OrderWorkflow(Clock.systemUTC()).saveOrder().active()).isFalse();
    }

    @Test
    @DisplayName("M17 §4 · extracting the method into another bean fixes self-invocation")
    void extractedBeanIsAdvised() {
        assertThat(context.getBean(OrderFacade.class).placeOrder().active()).isTrue();
        assertThat(transactionManager.events()).containsExactly("begin tx1", "commit tx1");
    }

    @Configuration(proxyBeanMethods = false)
    @EnableTransactionManagement(proxyTargetClass = true)
    static class TxConfig {

        @Bean
        RecordingTransactionManager transactionManager() {
            return new RecordingTransactionManager();
        }

        @Bean
        OrderWorkflow orderWorkflow() {
            return new OrderWorkflow(Clock.systemUTC());
        }

        @Bean
        OrderWriter orderWriter() {
            return new OrderWriter();
        }

        @Bean
        OrderFacade orderFacade(OrderWriter writer) {
            return new OrderFacade(writer);
        }
    }
}
