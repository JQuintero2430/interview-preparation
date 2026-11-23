package dev.interview.javalanguage.m05.s09;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.function.Function;

// A project-level Function whose body may throw a checked exception, plus the adapter that streams need.
@FunctionalInterface
public interface CheckedFunction<T, R> {

    R apply(T t) throws Exception;

    // Adapts to java.util.function.Function: unchecked exceptions pass through, checked ones are wrapped
    // with their cause kept (UncheckedIOException for I/O, so callers can still catch the I/O case).
    static <T, R> Function<T, R> unchecked(CheckedFunction<? super T, ? extends R> body) {
        return t -> {
            try {
                return body.apply(t);
            } catch (RuntimeException e) {
                throw e;
            } catch (Exception e) {
                throw wrap(e);
            }
        };
    }

    private static RuntimeException wrap(Exception e) {
        if (e instanceof IOException io) {
            return new UncheckedIOException(io);
        }
        if (e instanceof InterruptedException) {
            // Catching InterruptedException clears the thread's interrupt flag: set it again for the caller.
            Thread.currentThread().interrupt();
        }
        return new IllegalStateException(e);
    }
}
