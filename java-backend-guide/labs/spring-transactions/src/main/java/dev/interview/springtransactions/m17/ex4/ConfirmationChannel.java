package dev.interview.springtransactions.m17.ex4;

/** Port to the outside world: an e-mail or a broker send that cannot be rolled back. */
@FunctionalInterface
public interface ConfirmationChannel {

    void send(long orderId);
}
