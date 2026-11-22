package dev.interview.javalanguage.m05.s02;

import java.util.function.IntSupplier;
import java.util.function.Supplier;

// One lambda expression per method, so each method is exactly one invokedynamic call site.
public final class LambdaSites {

    private LambdaSites() {}

    public static Runnable nonCapturing() {
        return () -> {};
    }

    public static IntSupplier capturing(int value) {
        return () -> value;
    }

    public static Runnable anonymous() {
        return new Runnable() {
            @Override
            public void run() {}
        };
    }

    public static StackTraceElement[] traceInsideLambda() {
        Supplier<StackTraceElement[]> trace = () -> new Throwable().getStackTrace();
        return trace.get();
    }
}
