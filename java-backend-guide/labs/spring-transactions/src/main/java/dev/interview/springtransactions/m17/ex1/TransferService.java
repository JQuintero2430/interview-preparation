package dev.interview.springtransactions.m17.ex1;

/** Runs the remote fraud check outside any transaction, then crosses a proxy into the transactional posting. */
public class TransferService {

    private final FraudCheck fraudCheck;
    private final TransferPosting posting;

    public TransferService(FraudCheck fraudCheck, TransferPosting posting) {
        this.fraudCheck = fraudCheck;
        this.posting = posting;
    }

    public void transfer(String from, String to, long cents) {
        fraudCheck.approve(from, cents);
        posting.post(from, to, cents);
    }
}
