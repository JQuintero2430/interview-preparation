package dev.interview.springtransactions.m17.s03;

import org.springframework.transaction.support.TransactionSynchronizationManager;

/** What the current thread knows about its transaction, read from TransactionSynchronizationManager. */
public record TxSnapshot(boolean active, String name) {

    public static TxSnapshot current() {
        return new TxSnapshot(
                TransactionSynchronizationManager.isActualTransactionActive(),
                TransactionSynchronizationManager.getCurrentTransactionName());
    }
}
