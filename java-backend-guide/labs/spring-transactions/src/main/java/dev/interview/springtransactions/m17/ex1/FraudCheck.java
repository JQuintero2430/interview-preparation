package dev.interview.springtransactions.m17.ex1;

/** A remote call; it must not run inside the transaction (it would hold a connection while it waits). */
@FunctionalInterface
public interface FraudCheck {

    void approve(String from, long cents);
}
