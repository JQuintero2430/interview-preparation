package dev.interview.javalanguage.m06.s01;

// "Checked" is decided by where a class sits in the hierarchy (JLS §11.1.1), nothing else.
public enum ExceptionKind {
    CHECKED,
    UNCHECKED;

    public static ExceptionKind of(Class<? extends Throwable> type) {
        boolean unchecked = RuntimeException.class.isAssignableFrom(type) || Error.class.isAssignableFrom(type);
        return unchecked ? UNCHECKED : CHECKED;
    }
}
