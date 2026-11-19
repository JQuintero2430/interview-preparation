package dev.interview.javalanguage.m02.outputs;

import dev.interview.javalanguage.m02.s02.NoHashPoint;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

// Module 02 Q02.05: equal points without hashCode land in a HashSet twice and miss in a HashMap, unless the identity
// hash codes happen to collide.
public final class Q02_05 {

    private Q02_05() {}

    public static void main(String[] args) {
        NoHashPoint a = new NoHashPoint(1, 2);
        NoHashPoint b = new NoHashPoint(1, 2);
        System.out.println(a.equals(b) + " " + (a.hashCode() == b.hashCode()));

        Set<NoHashPoint> set = new HashSet<>();
        set.add(a);
        set.add(b);
        System.out.println(set.size());

        Map<NoHashPoint, String> map = new HashMap<>();
        map.put(a, "first");
        System.out.println(map.get(b));
    }
}
