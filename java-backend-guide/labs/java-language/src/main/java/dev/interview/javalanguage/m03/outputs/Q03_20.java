package dev.interview.javalanguage.m03.outputs;

// Module 03 Q03.20: defect on purpose. Inside pickTwo, T erases to Object, so the varargs array javac creates for
// toArray(a, b) is an Object[], and it escapes to a caller that expects a String[].
public final class Q03_20 {

    private Q03_20() {}

    public static void main(String[] args) {
        String[] picked = pickTwo("a", "b", "c");
        System.out.println(picked.length);
    }

    @SuppressWarnings("unchecked") // the generic array creation for toArray(a, b) is the bug this question shows
    public static <T> T[] pickTwo(T a, T b, T c) {
        return toArray(a, b);
    }

    @SuppressWarnings("unchecked") // the warning is right: returning the varargs array exposes it to callers
    private static <T> T[] toArray(T... args) {
        return args;
    }
}
