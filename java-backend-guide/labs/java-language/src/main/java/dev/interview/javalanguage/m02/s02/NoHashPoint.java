package dev.interview.javalanguage.m02.s02;

// Module 02 §2: equals without hashCode, the contract break on purpose.
public final class NoHashPoint {

    private final int x;
    private final int y;

    public NoHashPoint(int x, int y) {
        this.x = x;
        this.y = y;
    }

    // Deliberate bug: equals is overridden, hashCode is not, so equal points keep their identity hash codes.
    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof NoHashPoint that)) {
            return false;
        }
        return x == that.x && y == that.y;
    }
}
