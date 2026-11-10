package dev.interview.javalanguage.m02.s05;

import java.util.List;
import java.util.Objects;

/** Module 02 §5: the two leak points: no copy in, no copy out. */
public final class LeakyRoster {

    private final List<String> members;

    public LeakyRoster(List<String> members) {
        this.members = Objects.requireNonNull(members);
    }

    public List<String> members() {
        return members;
    }
}
