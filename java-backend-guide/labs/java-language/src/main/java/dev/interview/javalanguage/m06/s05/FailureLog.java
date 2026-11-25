package dev.interview.javalanguage.m06.s05;

@FunctionalInterface
public interface FailureLog {

    void failed(String message, Throwable failure);
}
