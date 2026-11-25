package dev.interview.javalanguage.m06.s05;

// Run in a child JVM by the tests: a default handler sees main's exception but cannot change the exit status.
public final class MainThrowsWithDefaultHandler {

    private MainThrowsWithDefaultHandler() {}

    public static void main(String[] args) {
        Thread.setDefaultUncaughtExceptionHandler((thread, failure) ->
                System.out.println("handled in " + thread.getName() + ": " + failure.getMessage()));
        throw new IllegalStateException("config missing");
    }
}
