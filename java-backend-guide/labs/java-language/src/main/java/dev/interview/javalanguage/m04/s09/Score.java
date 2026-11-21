package dev.interview.javalanguage.m04.s09;

import java.util.Objects;

/** One submitted score. */
public record Score(String player, int points) {

    public Score {
        Objects.requireNonNull(player, "player");
        if (points < 0) {
            throw new IllegalArgumentException("points must not be negative: " + points);
        }
    }
}
