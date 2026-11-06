package dev.interview.springtransactions.m17.ex1;

import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * An in-memory ledger that behaves like a JDBC connection: outside a transaction a write applies at once
 * (auto-commit); inside one it is held until the transaction commits and dropped on rollback.
 */
public class Ledger {

    private final List<String> entries = new CopyOnWriteArrayList<>();
    private final Set<String> frozen = ConcurrentHashMap.newKeySet();

    public void freeze(String account) {
        frozen.add(account);
    }

    public void debit(String account, long cents) {
        write("debit " + account + " " + cents);
    }

    public void credit(String account, long cents) {
        if (frozen.contains(account)) {
            throw new IllegalStateException("account " + account + " is frozen");
        }
        write("credit " + account + " " + cents);
    }

    public List<String> entries() {
        return List.copyOf(entries);
    }

    private void write(String entry) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            entries.add(entry); // auto-commit
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                entries.add(entry);
            }
        });
    }
}
