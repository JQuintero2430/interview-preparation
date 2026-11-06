package dev.interview.javalanguage.m01.s06;

// Module 01 §6: encapsulation protects an invariant (the balance never goes below zero), so there is no setter.
public final class Wallet {

    private long cents;

    public void deposit(long amount) {
        requirePositive(amount);
        cents = Math.addExact(cents, amount);
    }

    public void withdraw(long amount) {
        requirePositive(amount);
        if (amount > cents) {
            throw new IllegalStateException("insufficient funds");
        }
        cents -= amount;
    }

    public long balance() {
        return cents;
    }

    private static void requirePositive(long amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("amount must be positive");
        }
    }
}
