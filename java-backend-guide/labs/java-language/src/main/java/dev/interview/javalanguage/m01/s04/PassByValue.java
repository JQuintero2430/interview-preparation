package dev.interview.javalanguage.m01.s04;

// Module 01 §4: each parameter is a new variable initialized with a copy of the argument's value (JLS §8.4.1).
// For a reference type that value is the reference, so the callee shares the object but not the caller's variable.
public final class PassByValue {

    private PassByValue() {}

    // Teaching foil: swaps the two parameter copies only; the caller's variables still point where they did.
    static void swap(Basket a, Basket b) {
        Basket temp = a;
        a = b;
        b = temp;
    }

    static void addThrough(Basket basket, String item) {
        basket.add(item);
    }

    // Teaching foil: the new Basket is reachable only through the parameter copy and is lost on return.
    static void reassign(Basket basket, String item) {
        basket = new Basket();
        basket.add(item);
    }
}
