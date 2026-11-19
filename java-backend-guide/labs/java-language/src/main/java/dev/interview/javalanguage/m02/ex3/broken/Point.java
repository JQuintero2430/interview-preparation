package dev.interview.javalanguage.m02.ex3.broken;

import java.util.Comparator;

/** Module 02 Ex02.3, starting code: three deliberate defects for the exercise to repair. */
public class Point {

    // Deliberate defect: subtraction overflows when the two values are far apart.
    public static final Comparator<Point> BY_X_THEN_Y = (a, b) -> a.x() != b.x() ? a.x() - b.x() : a.y() - b.y();

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

    // Deliberate defect: equals is overridden and hashCode is not.
    @Override
    public boolean equals(Object o) {
        return o instanceof Point other && x == other.x && y == other.y;
    }
}
