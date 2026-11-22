package dev.interview.javalanguage.m05.s01;

import java.util.Comparator;

// One comparator written the pre-Java 8 way and as a lambda; both order strings by length.
public final class LengthOrder {

    public static final Comparator<String> ANONYMOUS = new Comparator<String>() {
        @Override
        public int compare(String a, String b) {
            return Integer.compare(a.length(), b.length());
        }
    };

    public static final Comparator<String> LAMBDA = (a, b) -> Integer.compare(a.length(), b.length());

    private LengthOrder() {}
}
