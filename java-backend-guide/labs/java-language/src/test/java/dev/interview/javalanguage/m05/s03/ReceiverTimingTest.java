package dev.interview.javalanguage.m05.s03;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNullPointerException;

import java.util.function.Consumer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ReceiverTimingTest {

    @Test
    @DisplayName("M05 §3 · a bound method reference keeps the receiver it saw when it was evaluated")
    void boundReference_keepsReceiver_lambdaRereadsField() {
        var first = new Mailbox();
        var second = new Mailbox();
        var router = new Router(first);
        Consumer<String> reference = router.viaReference();
        Consumer<String> lambda = router.viaLambda();

        router.switchTo(second);
        reference.accept("by reference");
        lambda.accept("by lambda");

        assertThat(first.received()).containsExactly("by reference");
        assertThat(second.received()).containsExactly("by lambda");
    }

    @Test
    @DisplayName("M05 §3 · a bound method reference on null throws at creation")
    void boundReference_onNull_throwsWhenEvaluated() {
        var router = new Router(null);

        assertThatNullPointerException().isThrownBy(router::viaReference);
    }

    @Test
    @DisplayName("M05 §3 · the equivalent lambda on null throws only when it is called")
    void lambda_onNull_throwsOnlyWhenCalled() {
        var router = new Router(null);
        Consumer<String> lambda = router.viaLambda();

        assertThatNullPointerException().isThrownBy(() -> lambda.accept("lost"));
    }
}
