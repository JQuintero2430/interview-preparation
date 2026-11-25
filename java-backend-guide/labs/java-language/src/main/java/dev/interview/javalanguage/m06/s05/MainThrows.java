package dev.interview.javalanguage.m06.s05;

// Run in a child JVM by the tests: main ends with an uncaught exception.
public final class MainThrows {

    private MainThrows() {}

    public static void main(String[] args) {
        System.out.println("starting");
        throw new IllegalStateException("config missing");
    }
}
