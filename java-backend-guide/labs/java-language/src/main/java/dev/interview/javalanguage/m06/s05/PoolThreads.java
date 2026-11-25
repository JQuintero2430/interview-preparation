package dev.interview.javalanguage.m06.s05;

import java.util.concurrent.ThreadFactory;

// A ThreadFactory for a pool whose threads report uncaught exceptions to a chosen handler.
public final class PoolThreads {

    private PoolThreads() {}

    public static ThreadFactory withHandler(String namePrefix, Thread.UncaughtExceptionHandler handler) {
        return Thread.ofPlatform()
                .name(namePrefix, 0)
                .uncaughtExceptionHandler(handler)
                .factory();
    }
}
