package dev.interview.javalanguage.m06.s05;

@FunctionalInterface
public interface TaskFailureListener {

    void taskFailed(Runnable task, Throwable failure);
}
