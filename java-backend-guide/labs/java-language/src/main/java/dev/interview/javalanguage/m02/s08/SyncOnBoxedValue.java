package dev.interview.javalanguage.m02.s08;

public final class SyncOnBoxedValue {

    private static final int BOXED_VALUE = 42;

    private static final String LOCKED_PREFIX = "locked ";

    private SyncOnBoxedValue() {}

    public static void main(String[] args) {
        // Static type Object keeps javac silent; only HotSpot detects it at run time.
        Object lock = Integer.valueOf(BOXED_VALUE);
        synchronized (lock) {
            System.out.println(LOCKED_PREFIX + lock);
        }
    }
}
