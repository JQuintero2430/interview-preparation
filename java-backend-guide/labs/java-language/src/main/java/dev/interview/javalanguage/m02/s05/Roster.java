package dev.interview.javalanguage.m02.s05;

import java.util.List;

/** Module 02 §5: the fix: copy in with List.copyOf, validate the copy, and return the unmodifiable field as is. */
public final class Roster {

    private static final String EMPTY_MESSAGE = "a roster needs at least one member";

    private final List<String> members;

    public Roster(List<String> members) {
        // Copy first: validating the caller's list would leave a window to change it after the check (SCG 6-3).
        this.members = List.copyOf(members);
        if (this.members.isEmpty()) {
            throw new IllegalArgumentException(EMPTY_MESSAGE);
        }
    }

    public List<String> members() {
        return members;
    }
}
