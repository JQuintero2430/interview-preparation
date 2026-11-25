package dev.interview.javalanguage.m06.s05;

@FunctionalInterface
public interface OrderProcessor {

    void process(String message) throws InterruptedException;
}
