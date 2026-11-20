package dev.interview.javalanguage.m03.outputs;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

// Module 03 Q03.05: the same diamond infers different type arguments depending on the target type.
public final class Q03_05 {

    private Q03_05() {}

    public static void main(String[] args) {
        List<String> a = new ArrayList<>();
        var b = new ArrayList<>();
        var c = new ArrayList<String>();
        List<String> d = Collections.emptyList();
        List<String> e = Collections.<String>emptyList().stream().toList();

        b.add(1);
        b.add("two");
        System.out.println(b);
        c.add("three");
        a.addAll(c);
        System.out.println(a + " " + d.size() + " " + e);
    }
}
