package dev.interview.springtransactions.m17.ex1.broken;

import dev.interview.springtransactions.m17.ex1.FraudCheck;
import dev.interview.springtransactions.m17.ex1.Ledger;
import org.springframework.transaction.annotation.Transactional;

/** The code the exercise starts from: post() is annotated, but transfer() reaches it through `this`. */
public class TransferService {

    private final FraudCheck fraudCheck;
    private final Ledger ledger;

    public TransferService(FraudCheck fraudCheck, Ledger ledger) {
        this.fraudCheck = fraudCheck;
        this.ledger = ledger;
    }

    public void transfer(String from, String to, long cents) {
        fraudCheck.approve(from, cents);
        post(from, to, cents);
    }

    @Transactional
    public void post(String from, String to, long cents) {
        ledger.debit(from, cents);
        ledger.credit(to, cents);
    }
}
