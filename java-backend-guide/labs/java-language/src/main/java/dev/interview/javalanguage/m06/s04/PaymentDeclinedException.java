package dev.interview.javalanguage.m06.s04;

import java.io.Serial;
import java.util.Objects;

// Checked: a decline is an expected outcome the caller must decide on (ask for another card, or stop).
public class PaymentDeclinedException extends Exception {

    @Serial
    private static final long serialVersionUID = 1L;

    private final String orderId;
    private final DeclineReason reason;

    public PaymentDeclinedException(String orderId, DeclineReason reason) {
        this(orderId, reason, null);
    }

    public PaymentDeclinedException(String orderId, DeclineReason reason, Throwable cause) {
        super("payment for order " + orderId + " declined: " + reason, cause);
        this.orderId = Objects.requireNonNull(orderId);
        this.reason = Objects.requireNonNull(reason);
    }

    public String orderId() {
        return orderId;
    }

    public DeclineReason reason() {
        return reason;
    }
}
