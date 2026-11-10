package dev.interview.javalanguage.m01.outputs;

// Module 01 Q01.19: overload resolution tries widening, then boxing, then varargs, and stops at the first phase with a
// match.
public final class Q01_19 {

    private Q01_19() {}

    static String m(long value) {
        return "long";
    }

    static String m(Integer value) {
        return "Integer";
    }

    static String m(Object value) {
        return "Object";
    }

    static String m(int... values) {
        return "varargs";
    }

    public static void main(String[] args) {
        System.out.println(m(1));
        System.out.println(m(Integer.valueOf(1)));
        System.out.println(m(1.5));
        System.out.println(m());
        System.out.println(m(1, 2));
    }
}
