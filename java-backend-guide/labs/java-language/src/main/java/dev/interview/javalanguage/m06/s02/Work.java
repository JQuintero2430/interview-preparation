package dev.interview.javalanguage.m06.s02;

// A unit of work that may throw one checked exception type E, which callers see exactly (JLS §8.4.6).
@FunctionalInterface
public interface Work<T, E extends Exception> {

    T run() throws E;
}
