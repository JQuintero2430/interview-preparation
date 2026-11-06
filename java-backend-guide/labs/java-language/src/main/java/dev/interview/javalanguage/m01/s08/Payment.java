package dev.interview.javalanguage.m01.s08;

// Module 01 §8: the base type. A plain transfer carries no fee; subclasses override feeCents.
public class Payment {

    private final long amountCents;

    public Payment(long amountCents) {
        this.amountCents = amountCents;
    }

    public long amountCents() {
        return amountCents;
    }

    public long feeCents() {
        return 0;
    }
}
