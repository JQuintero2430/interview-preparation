package dev.interview.springtransactions.m17.s05;

/** A checked exception: by default it does not trigger a rollback. */
public class PaymentException extends Exception {

    public PaymentException(String message) {
        super(message);
    }
}
