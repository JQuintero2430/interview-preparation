package dev.interview.javalanguage.m05.s09;

// The "sneaky throw" trick, kept here so a test can show what it does. Do not use it in application code:
// it throws a checked exception that no signature declares, so callers cannot catch it by its type.
public final class SneakyThrow {

    private SneakyThrow() {}

    // E is inferred as RuntimeException at the call site, so the compiler sees no checked exception.
    // The cast to E is unchecked (erased to Throwable), so at run time the original exception is thrown.
    @SuppressWarnings("unchecked")
    public static <E extends Throwable> RuntimeException sneakyThrow(Throwable t) throws E {
        throw (E) t;
    }
}
