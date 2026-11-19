package dev.interview.javalanguage.m02.ex3;

import java.util.Comparator;

/** Module 02 Ex02.3: the repair; a record is final, and its equals and hashCode are generated from x and y. */
public record Point(int x, int y) {

    // comparingInt calls Integer.compare, which cannot overflow.
    public static final Comparator<Point> BY_X_THEN_Y =
            Comparator.comparingInt(Point::x).thenComparingInt(Point::y);
}
