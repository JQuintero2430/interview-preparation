package dev.interview.javalanguage.m06.s01;

// Demonstration only: shows that the JVM does not enforce checked exceptions (JVMS §4.7.5).
// Do not use it in production code: callers cannot catch the checked type by name.
public final class UncheckedThrow {

    private UncheckedThrow() {}

    public static void sneakyThrow(Throwable failure) {
        UncheckedThrow.<RuntimeException>rethrow(failure);
    }

    // E is RuntimeException at the call site, so javac sees no checked exception;
    // the cast is erased, so at run time the original Throwable is thrown unchanged.
    @SuppressWarnings("unchecked")
    private static <E extends Throwable> void rethrow(Throwable failure) throws E {
        throw (E) failure;
    }
}
