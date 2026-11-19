package dev.interview.javalanguage.m02.ex3.broken;

import dev.interview.javalanguage.m02.ex3.Color;

/** Module 02 Ex02.3, starting code: a subclass that adds a field to a class with an instanceof equals. */
public class ColorPoint extends Point {

    private final Color color;

    public ColorPoint(int x, int y, Color color) {
        super(x, y);
        this.color = color;
    }

    public Color color() {
        return color;
    }

    // Deliberate defect: a Point accepts a ColorPoint as equal, and this method rejects every plain Point.
    @Override
    public boolean equals(Object o) {
        return o instanceof ColorPoint other && super.equals(other) && color == other.color;
    }
}
