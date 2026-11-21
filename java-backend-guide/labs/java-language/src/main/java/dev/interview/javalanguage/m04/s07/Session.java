package dev.interview.javalanguage.m04.s07;

import java.time.Duration;
import java.time.Instant;
import java.util.Objects;

/** A user session, last seen at {@code lastSeen}. */
public record Session(String id, String user, Instant lastSeen) {

    public Session {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(user, "user");
        Objects.requireNonNull(lastSeen, "lastSeen");
    }

    /** Idle means unseen for longer than {@code maxIdle}; exactly {@code maxIdle} still counts as active. */
    public boolean idleAt(Instant now, Duration maxIdle) {
        return lastSeen.plus(maxIdle).isBefore(now);
    }
}
