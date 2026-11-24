package dev.interview.javalanguage.m06.s04;

// Unbounded recursion: every call adds a frame until the thread's stack is exhausted.
public final class Recursion {

    private Recursion() {}

    public static int depth(int n) {
        return depth(n + 1) + 1;
    }
}
