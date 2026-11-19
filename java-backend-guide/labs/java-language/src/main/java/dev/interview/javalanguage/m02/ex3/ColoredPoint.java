package dev.interview.javalanguage.m02.ex3;

import java.util.Objects;

/** Module 02 Ex02.3: the repair by composition; a colored point has a point, so it never equals a plain one. */
public record ColoredPoint(Point point, Color color) {

    private static final String POINT = "point";
    private static final String COLOR = "color";

    public ColoredPoint {
        Objects.requireNonNull(point, POINT);
        Objects.requireNonNull(color, COLOR);
    }
}
