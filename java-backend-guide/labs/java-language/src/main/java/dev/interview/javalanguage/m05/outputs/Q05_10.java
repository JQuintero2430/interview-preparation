package dev.interview.javalanguage.m05.outputs;

import java.util.List;
import java.util.stream.Stream;

// Module 05 Q05.10: nothing runs before the terminal operation; then each element passes every stage in turn.
public final class Q05_10 {

    private Q05_10() {}

    public static void main(String[] args) {
        Stream<String> pipeline = Stream.of("a", "bb", "ccc")
                .peek(s -> System.out.println("peek " + s))
                .filter(s -> {
                    System.out.println("filter " + s);
                    return s.length() > 1;
                })
                .map(s -> {
                    System.out.println("map " + s);
                    return s.toUpperCase();
                });
        System.out.println("built");
        List<String> result = pipeline.toList();
        System.out.println("result " + result);
    }
}
