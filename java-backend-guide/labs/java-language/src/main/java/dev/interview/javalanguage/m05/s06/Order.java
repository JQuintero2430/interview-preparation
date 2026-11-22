package dev.interview.javalanguage.m05.s06;

import java.util.List;

public record Order(String id, List<Line> lines) {
    public Order {
        lines = List.copyOf(lines);
    }
}
