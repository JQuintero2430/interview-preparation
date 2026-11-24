package dev.interview.javalanguage.m06.s04;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.net.SocketTimeoutException;
import java.util.Map;
import javax.tools.Diagnostic;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CustomExceptionTest {

    @Test
    @DisplayName("M06 §4 · a custom exception carries its context as fields and builds its message from them")
    void customException_carriesContext() {
        PaymentDeclinedException declined = new PaymentDeclinedException("ord-42", DeclineReason.CARD_EXPIRED);

        assertThat(declined.orderId()).isEqualTo("ord-42");
        assertThat(declined.reason().customerCanRetry()).isTrue();
        assertThat(declined)
                .hasMessage("payment for order ord-42 declined: CARD_EXPIRED")
                .hasNoCause();
    }

    @Test
    @DisplayName("M06 §4 · the cause constructor keeps the provider's exception")
    void customException_keepsCause() {
        SocketTimeoutException timeout = new SocketTimeoutException("Read timed out");

        PaymentDeclinedException declined =
                new PaymentDeclinedException("ord-42", DeclineReason.FRAUD_SUSPECTED, timeout);

        assertThat(declined.getCause()).isSameAs(timeout);
        assertThat(declined.reason().customerCanRetry()).isFalse();
    }

    @Test
    @DisplayName("M06 §4 · every exception is Serializable through Throwable, fields included")
    void customException_isSerializable() throws IOException, ClassNotFoundException {
        PaymentDeclinedException declined = new PaymentDeclinedException("ord-42", DeclineReason.INSUFFICIENT_FUNDS);
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) {
            out.writeObject(declined);
        }

        Object copy;
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes.toByteArray()))) {
            copy = in.readObject();
        }

        assertThat(declined).isInstanceOf(Serializable.class);
        assertThat(copy).isInstanceOf(PaymentDeclinedException.class);
        assertThat((Throwable) copy).hasMessage(declined.getMessage());
        assertThat(((PaymentDeclinedException) copy).reason()).isEqualTo(DeclineReason.INSUFFICIENT_FUNDS);
    }

    @Test
    @DisplayName("M06 §4 · javac -Xlint:serial warns about an exception without serialVersionUID")
    void lintSerial_warnsAboutMissingSerialVersionUid() {
        String source = """
                class OrderLocked extends RuntimeException {
                    OrderLocked(String message) { super(message); }
                }
                """;

        var result = InMemoryCompiler.compile(Map.of("OrderLocked", source), "-Xlint:serial");

        assertThat(result.success()).isTrue();
        assertThat(result.diagnostics())
                .filteredOn(d -> d.getKind() == Diagnostic.Kind.WARNING)
                .extracting(Diagnostic::getCode)
                .containsExactly("compiler.warn.missing.SVUID");
    }
}
