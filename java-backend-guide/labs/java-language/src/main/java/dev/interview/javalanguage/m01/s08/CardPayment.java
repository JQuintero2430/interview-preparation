package dev.interview.javalanguage.m01.s08;

// Module 01 §8: the override runs whenever the object is a CardPayment, whatever the reference type.
public final class CardPayment extends Payment {

    public CardPayment(long amountCents) {
        super(amountCents);
    }

    @Override
    public long feeCents() {
        return amountCents() * 2 / 100;
    }
}
