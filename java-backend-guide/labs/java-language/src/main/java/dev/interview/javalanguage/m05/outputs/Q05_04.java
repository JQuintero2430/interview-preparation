package dev.interview.javalanguage.m05.outputs;

import java.util.function.Function;
import java.util.function.Predicate;

// Module 05 Q05.04: andThen and compose apply functions in opposite orders; and/or bind left to right.
public final class Q05_04 {

    private Q05_04() {}

    public static void main(String[] args) {
        Function<Integer, Integer> plusOne = x -> x + 1;
        Function<Integer, Integer> twice = x -> x * 2;
        System.out.println(plusOne.andThen(twice).apply(5));
        System.out.println(plusOne.compose(twice).apply(5));
        System.out.println(plusOne.andThen(twice).compose(twice).apply(5));

        Predicate<String> isEmpty = String::isEmpty;
        System.out.println(isEmpty.negate().test(""));
        System.out.println(Predicate.not(String::isBlank).test(" a "));
        System.out.println(
                isEmpty.or(s -> s.startsWith("#")).and(s -> s.length() < 3).test("#ab"));
    }
}
