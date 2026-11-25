package dev.interview.javalanguage.m06.s06;

import java.util.Objects;

public record LineItem(String name, int quantity) {

    public LineItem {
        Objects.requireNonNull(name);
    }
}
