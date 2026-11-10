package dev.interview.javalanguage.m02.s03;

import java.util.Objects;

/** Module 02 §3: the composition fix, which holds a Point instead of extending it and keeps all three equals clauses. */
public record ColoredPoint(Point point, Color color) {

    public ColoredPoint {
        Objects.requireNonNull(point);
        Objects.requireNonNull(color);
    }
}
