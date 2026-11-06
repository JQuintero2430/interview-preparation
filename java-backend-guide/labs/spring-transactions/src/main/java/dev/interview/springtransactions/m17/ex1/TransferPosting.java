package dev.interview.springtransactions.m17.ex1;

import org.springframework.transaction.annotation.Transactional;

/** The transaction boundary, in its own bean so every caller reaches it through the proxy. */
public class TransferPosting {

    private final Ledger ledger;

    public TransferPosting(Ledger ledger) {
        this.ledger = ledger;
    }

    @Transactional
    public void post(String from, String to, long cents) {
        ledger.debit(from, cents);
        ledger.credit(to, cents);
    }
}
