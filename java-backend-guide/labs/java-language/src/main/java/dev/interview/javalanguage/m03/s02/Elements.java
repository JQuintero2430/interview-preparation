package dev.interview.javalanguage.m03.s02;

import java.util.List;

// Module 03 §2: a generic method in a non-generic class. The <T> before the return type declares the parameter.
public final class Elements {

    private Elements() {}

    public static <T> T firstOr(List<T> elements, T fallback) {
        return elements.isEmpty() ? fallback : elements.get(0);
    }
}
