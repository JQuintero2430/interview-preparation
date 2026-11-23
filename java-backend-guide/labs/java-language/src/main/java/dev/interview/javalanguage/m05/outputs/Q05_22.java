package dev.interview.javalanguage.m05.outputs;

import java.util.List;
import java.util.stream.Gatherers;

// Module 05 Q05.22: fixed windows, sliding windows and a prefix scan over the same five elements.
public final class Q05_22 {

    private Q05_22() {}

    public static void main(String[] args) {
        List<Integer> source = List.of(1, 2, 3, 4, 5);
        System.out.println(source.stream().gather(Gatherers.windowFixed(2)).toList());
        System.out.println(source.stream().gather(Gatherers.windowSliding(2)).toList());
        System.out.println(
                source.stream().gather(Gatherers.scan(() -> 0, Integer::sum)).toList());
    }
}
