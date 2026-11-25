package dev.interview.javalanguage.m06.outputs;

// Module 06 Q06.07: resources close in reverse order before catch runs; close failures ride along as suppressed.
public final class Q06_07 {

    private Q06_07() {}

    record Step(String name) implements AutoCloseable {
        Step {
            System.out.println("open " + name);
        }

        @Override
        public void close() {
            System.out.println("close " + name);
            throw new IllegalStateException("close " + name + " failed");
        }
    }

    public static void main(String[] args) {
        try (Step a = new Step("A");
                Step b = new Step("B")) {
            System.out.println("body");
            throw new IllegalArgumentException("body failed");
        } catch (IllegalArgumentException e) {
            System.out.println("caught " + e.getMessage());
            for (Throwable suppressed : e.getSuppressed()) {
                System.out.println("suppressed " + suppressed.getMessage());
            }
        } finally {
            System.out.println("finally");
        }
    }
}
