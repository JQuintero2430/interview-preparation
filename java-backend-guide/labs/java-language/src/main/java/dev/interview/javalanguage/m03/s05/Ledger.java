package dev.interview.javalanguage.m03.s05;

import java.util.List;

// Module 03 §5: the declared type List<Money> of the field and the accessor is kept in the class file's Signature
// attribute.
public final class Ledger {

    private final List<Money> entries;

    public Ledger(List<Money> entries) {
        this.entries = List.copyOf(entries);
    }

    public List<Money> entries() {
        return entries;
    }
}
