package dev.interview.javalanguage.m02.s03;

import java.util.Objects;

/** Module 02 §3: the symmetric patch for ColorPoint, which restores symmetry but breaks transitivity. */
public class SymmetricColorPoint extends Point {

    private final Color color;

    public SymmetricColorPoint(int x, int y, Color color) {
        super(x, y);
        this.color = Objects.requireNonNull(color);
    }

    public Color color() {
        return color;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Point)) {
            return false;
        }
        if (!(o instanceof SymmetricColorPoint other)) {
            return super.equals(o);
        }
        return super.equals(other) && color == other.color;
    }

    // No hashCode override: this class equals plain Points, so its hash must match Point's.
}
