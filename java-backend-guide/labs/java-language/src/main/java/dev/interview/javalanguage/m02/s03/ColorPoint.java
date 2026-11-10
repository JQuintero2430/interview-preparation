package dev.interview.javalanguage.m02.s03;

import java.util.Objects;

/** Module 02 §3: a subclass that adds a field and keeps instanceof equals, which makes equals asymmetric. */
public class ColorPoint extends Point {

    private final Color color;

    public ColorPoint(int x, int y, Color color) {
        super(x, y);
        this.color = Objects.requireNonNull(color);
    }

    public Color color() {
        return color;
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof ColorPoint other && super.equals(other) && color == other.color;
    }

    @Override
    public int hashCode() {
        return 31 * super.hashCode() + color.hashCode();
    }
}
