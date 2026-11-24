package dev.interview.javalanguage.m06.s04;

// What the payment provider told us, reduced to the cases the caller handles differently.
public enum DeclineReason {
    INSUFFICIENT_FUNDS(true),
    CARD_EXPIRED(true),
    FRAUD_SUSPECTED(false);

    private final boolean customerCanRetry;

    DeclineReason(boolean customerCanRetry) {
        this.customerCanRetry = customerCanRetry;
    }

    public boolean customerCanRetry() {
        return customerCanRetry;
    }
}
