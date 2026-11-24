package dev.interview.javalanguage.m06.s04;

// Shows that the stack trace is recorded where the exception is constructed, not where it is thrown.
public final class StackTraces {

    private StackTraces() {}

    public static IllegalStateException createHere() {
        return new IllegalStateException("created in createHere");
    }

    public static void throwElsewhere(IllegalStateException prepared) {
        throw prepared;
    }

    public static final class NoTrace extends RuntimeException {

        public NoTrace(String message) {
            super(message);
        }

        @Override
        public synchronized Throwable fillInStackTrace() {
            return this;
        }
    }
}
