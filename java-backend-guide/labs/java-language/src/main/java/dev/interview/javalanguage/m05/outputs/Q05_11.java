package dev.interview.javalanguage.m05.outputs;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

// Module 05 Q05.11: short-circuiting operations decide how much of an infinite source is read.
public final class Q05_11 {

    private Q05_11() {}

    public static void main(String[] args) {
        List<Integer> visited = new ArrayList<>();
        int first = Stream.iterate(1, n -> n + 1)
                .peek(visited::add)
                .filter(n -> n * n > 20)
                .findFirst()
                .orElseThrow();
        System.out.println(first + " after " + visited.size());

        visited.clear();
        List<Integer> evens = Stream.iterate(1, n -> n + 1)
                .peek(visited::add)
                .filter(n -> n % 2 == 0)
                .limit(3)
                .toList();
        System.out.println(evens + " after " + visited.size());

        visited.clear();
        List<Integer> small = Stream.iterate(1, n -> n * 2)
                .peek(visited::add)
                .takeWhile(n -> n < 50)
                .toList();
        System.out.println(small + " after " + visited.size());

        visited.clear();
        List<Integer> limitedFirst = Stream.iterate(1, n -> n + 1)
                .peek(visited::add)
                .limit(3)
                .filter(n -> n % 2 == 0)
                .toList();
        System.out.println(limitedFirst + " after " + visited.size());
    }
}
