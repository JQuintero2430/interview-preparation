package dev.interview.springtransactions.m17.s13;

/** A remote payment provider: a network call whose latency the application does not control. */
@FunctionalInterface
public interface PaymentGateway {

    void charge(long orderId);
}
