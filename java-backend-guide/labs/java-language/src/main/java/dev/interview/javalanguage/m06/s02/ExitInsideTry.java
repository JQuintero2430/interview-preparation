package dev.interview.javalanguage.m06.s02;

// Run in a child JVM by the tests: System.exit never returns, so the finally block never runs.
public final class ExitInsideTry {

    private ExitInsideTry() {}

    public static void main(String[] args) {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> System.out.println("shutdown hook")));
        try {
            System.out.println("try");
            System.exit(3);
        } finally {
            System.out.println("finally");
        }
    }
}
