package dev.interview.javalanguage.m06.s02;

import java.util.ArrayList;
import java.util.List;

// Each method isolates one rule of JLS §14.17 and §14.20.2; the tests assert what it returns or throws.
public final class FinallyFlow {

    private FinallyFlow() {}

    // The return value is computed first, then finally runs, then the caller resumes.
    public static String returnThenFinally(List<String> events) {
        try {
            events.add("try");
            return computeResult(events);
        } finally {
            events.add("finally");
        }
    }

    // The returned int was copied when return ran; finally changes only the local variable.
    public static int finallyChangesReturnedPrimitive() {
        int count = 1;
        try {
            return count;
        } finally {
            count = 2;
        }
    }

    // The returned reference was copied, but it still points at the same list, which finally mutates.
    public static List<String> finallyMutatesReturnedList() {
        List<String> names = new ArrayList<>();
        names.add("try");
        try {
            return names;
        } finally {
            names.add("finally");
        }
    }

    // A return in finally replaces the pending exception: the IllegalStateException is discarded.
    @SuppressWarnings("finally")
    public static int returnInFinallyDiscardsException() {
        try {
            throw new IllegalStateException("lost");
        } finally {
            return 42;
        }
    }

    // A throw in finally replaces the pending exception; nothing records the first one.
    @SuppressWarnings("finally")
    public static void throwInFinallyReplacesException() {
        try {
            throw new IllegalArgumentException("from try");
        } finally {
            throw new IllegalStateException("from finally");
        }
    }

    // break and continue leave the try block abruptly too, so finally runs for every iteration.
    public static List<String> finallyOnBreakAndContinue() {
        List<String> events = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            try {
                if (i == 1) {
                    continue;
                }
                if (i == 3) {
                    break;
                }
                events.add("body " + i);
            } finally {
                events.add("finally " + i);
            }
        }
        return events;
    }

    // No catch matches, so finally runs and the exception keeps propagating.
    public static void unmatchedExceptionPropagatesAfterFinally(List<String> events) {
        try {
            events.add("try");
            throw new UnsupportedOperationException("no handler here");
        } catch (IllegalArgumentException e) {
            events.add("catch");
        } finally {
            events.add("finally");
        }
    }

    private static String computeResult(List<String> events) {
        events.add("return expression");
        return "result";
    }
}
