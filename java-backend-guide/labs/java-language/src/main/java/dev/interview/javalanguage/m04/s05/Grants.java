package dev.interview.javalanguage.m04.s05;

import java.util.Collection;
import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

/**
 * The permissions granted to a user, kept in an {@code EnumSet}: a bit vector with one bit per {@link Permission}
 * constant, so membership tests and {@code containsAll} are bit operations, and iteration follows declaration
 * order. It replaces an {@code int} of bit flags with a type-safe set.
 */
public final class Grants {

    private final EnumSet<Permission> granted;

    private Grants(EnumSet<Permission> granted) {
        this.granted = granted;
    }

    // EnumSet.copyOf(Collection) needs at least one element to learn the enum type, so start from noneOf.
    public static Grants of(Collection<Permission> permissions) {
        EnumSet<Permission> granted = EnumSet.noneOf(Permission.class);
        granted.addAll(permissions);
        return new Grants(granted);
    }

    public boolean allows(Set<Permission> required) {
        return granted.containsAll(required);
    }

    public Set<Permission> missing(Set<Permission> required) {
        EnumSet<Permission> missing = EnumSet.noneOf(Permission.class);
        missing.addAll(required);
        missing.removeAll(granted);
        return Collections.unmodifiableSet(missing);
    }

    public Set<Permission> granted() {
        return Collections.unmodifiableSet(granted);
    }
}
