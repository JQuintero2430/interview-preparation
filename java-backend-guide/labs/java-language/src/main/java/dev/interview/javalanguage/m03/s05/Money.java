package dev.interview.javalanguage.m03.s05;

// Module 03 §5: implementing Comparable<Money> makes javac emit a bridge compareTo(Object) that casts and delegates.
public record Money(long cents) implements Comparable<Money> {

    @Override
    public int compareTo(Money other) {
        return Long.compare(cents, other.cents);
    }
}
