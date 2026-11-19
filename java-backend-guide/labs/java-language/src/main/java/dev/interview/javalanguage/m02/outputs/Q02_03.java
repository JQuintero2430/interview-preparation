package dev.interview.javalanguage.m02.outputs;

import dev.interview.javalanguage.m02.s01.OverloadedPoint;
import java.util.HashSet;
import java.util.List;

// Module 02 Q02.03: equals(OverloadedPoint) is an overload, so only a caller with that static type reaches it.
public final class Q02_03 {

    private Q02_03() {}

    public static void main(String[] args) {
        OverloadedPoint a = new OverloadedPoint(1, 2);
        OverloadedPoint b = new OverloadedPoint(1, 2);

        System.out.println(a.equals(b));
        System.out.println(a.equals((Object) b));
        System.out.println(List.of(a).contains(b));
        System.out.println(new HashSet<>(List.of(a)).contains(b));
    }
}
