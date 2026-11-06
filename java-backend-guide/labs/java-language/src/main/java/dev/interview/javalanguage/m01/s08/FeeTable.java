package dev.interview.javalanguage.m01.s08;

// Module 01 §8: the bug. javac picks an overload from the argument's static type, so a card typed Payment pays 0.
public final class FeeTable {

    private FeeTable() {}

    public static long feeCents(Payment payment) {
        return 0;
    }

    public static long feeCents(CardPayment payment) {
        return payment.amountCents() * 2 / 100;
    }
}
