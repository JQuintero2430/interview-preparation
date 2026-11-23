package dev.interview.javalanguage.m05.s09;

import java.util.function.Function;

// One outcome per element: the pipeline keeps going, and the caller decides what a failure means afterwards.
public sealed interface Result<T> {

    record Success<T>(T value) implements Result<T> {}

    record Failure<T>(Exception error) implements Result<T> {}

    // Runs the body for one element and turns its outcome, value or exception, into a Result.
    static <T, R> Function<T, Result<R>> attempt(CheckedFunction<? super T, ? extends R> body) {
        return t -> {
            try {
                return new Success<>(body.apply(t));
            } catch (Exception e) {
                return new Failure<>(e);
            }
        };
    }
}
