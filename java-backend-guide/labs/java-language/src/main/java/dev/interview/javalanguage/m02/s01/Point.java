package dev.interview.javalanguage.m02.s01;

// Module 02 §1: a correct hand-written equals (identity shortcut, type check, field comparison).
public final class Point {

    private final int x;
    private final int y;

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public int x() {
        return x;
    }

    public int y() {
        return y;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof Point that)) {
            return false;
        }
        return x == that.x && y == that.y;
    }

    // Section 2 explains why hashCode must agree with equals: equal points must hash equally.
    @Override
    public int hashCode() {
        return 31 * x + y;
    }
}
