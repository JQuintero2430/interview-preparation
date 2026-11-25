package dev.interview.javalanguage.m06.outputs;

import java.util.ArrayList;
import java.util.List;

// Module 06 Q06.03: the return value is computed before finally runs, and an abrupt finally replaces the outcome.
public final class Q06_03 {

    private Q06_03() {}

    static String order() {
        try {
            System.out.println("try");
            return "result";
        } finally {
            System.out.println("finally");
        }
    }

    static int primitive() {
        int count = 1;
        try {
            return count;
        } finally {
            count = 2;
        }
    }

    static List<String> reference() {
        List<String> items = new ArrayList<>();
        try {
            items.add("try");
            return items;
        } finally {
            items.add("finally");
        }
    }

    @SuppressWarnings("finally")
    static int returnInFinally() {
        try {
            throw new IllegalStateException("lost");
        } finally {
            return 42;
        }
    }

    @SuppressWarnings("finally")
    static void throwInFinally() {
        try {
            throw new IllegalArgumentException("first");
        } finally {
            throw new IllegalStateException("second");
        }
    }

    public static void main(String[] args) {
        System.out.println(order());
        System.out.println(primitive());
        System.out.println(reference());
        System.out.println(returnInFinally());
        try {
            throwInFinally();
        } catch (RuntimeException e) {
            System.out.println(e + " cause=" + e.getCause() + " suppressed=" + e.getSuppressed().length);
        }
    }
}
