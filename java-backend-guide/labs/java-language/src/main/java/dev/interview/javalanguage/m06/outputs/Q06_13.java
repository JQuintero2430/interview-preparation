package dev.interview.javalanguage.m06.outputs;

import java.util.function.Consumer;

// Module 06 Q06.13: a periodic task that reports its own failures, so one bad run does not end the schedule.
public final class Q06_13 {

    private Q06_13() {}

    public static Runnable reportingFailures(Runnable task, Consumer<RuntimeException> onFailure) {
        return () -> {
            try {
                task.run();
            } catch (RuntimeException e) {
                onFailure.accept(e);
            }
        };
    }
}
