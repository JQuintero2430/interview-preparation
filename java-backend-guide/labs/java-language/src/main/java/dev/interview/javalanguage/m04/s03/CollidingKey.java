package dev.interview.javalanguage.m04.s03;

/**
 * A key whose every instance has the same hash code, so all of them land in one bin of a {@code HashMap}.
 * It is deliberately not {@code Comparable}: a tree bin can then order these keys only by tie-breaking, never
 * by {@code compareTo}.
 */
public record CollidingKey(String name) {

    private static final int SHARED_HASH = 42;

    @Override
    public int hashCode() {
        return SHARED_HASH;
    }
}
