package dev.interview.javalanguage.m02.outputs;

import dev.interview.javalanguage.m02.s03.Color;
import dev.interview.javalanguage.m02.s03.ColorPoint;
import dev.interview.javalanguage.m02.s03.GetClassPoint;
import dev.interview.javalanguage.m02.s03.Point;

// Module 02 Q02.09: instanceof equals answers differently in each direction once a subclass adds a field, and getClass
// equals rejects a subclass that adds nothing.
public final class Q02_09 {

    private Q02_09() {}

    public static void main(String[] args) {
        Point point = new Point(1, 2);
        ColorPoint colorPoint = new ColorPoint(1, 2, Color.RED);
        GetClassPoint plain = new GetClassPoint(1, 2);
        GetClassPoint subclass = new GetClassPoint(1, 2) {};

        System.out.println(point.equals(colorPoint));
        System.out.println(colorPoint.equals(point));
        System.out.println(plain.equals(subclass));
        System.out.println(subclass.equals(plain));
    }
}
