package dev.interview.javalanguage.m03.outputs;

import java.util.ArrayList;
import java.util.List;

// Module 03 Q03.15: one runtime class for every parameterization; instanceof accepts only checks it can perform.
public final class Q03_15 {

    private Q03_15() {}

    public static void main(String[] args) {
        List<String> strings = new ArrayList<>();
        List<Integer> numbers = new ArrayList<>();
        Object o = strings;

        System.out.println(strings.getClass() == numbers.getClass());
        System.out.println(strings.getClass().getName());
        System.out.println(o instanceof List<?>);
        System.out.println(strings instanceof ArrayList<String>);
    }
}
