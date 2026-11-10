package dev.interview.javalanguage.m02.s01;

// Module 02 §1: the equals overload trap, a point whose equals(OverloadedPoint) never overrides equals(Object).
public final class OverloadedPoint {

    private final int x;
    private final int y;

    public OverloadedPoint(int x, int y) {
        this.x = x;
        this.y = y;
    }

    // Deliberate bug: overloads equals(Object) instead of overriding it
    public boolean equals(OverloadedPoint other) {
        return x == other.x && y == other.y;
    }

    // Correct on purpose, so the overload is the only defect
    @Override
    public int hashCode() {
        return 31 * x + y;
    }
}
