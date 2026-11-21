package dev.interview.javalanguage.m04.s07;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * Open sessions in arrival order. Removal during traversal goes through the iterator ({@link Iterator#remove}) or
 * {@link java.util.Collection#removeIf}, never through {@code sessions.remove(…)} inside a for-each loop, which a
 * fail-fast iterator reports with {@code ConcurrentModificationException} or, for the second-to-last element, by
 * silently skipping the last one. Not thread-safe (module 12).
 */
public final class SessionRegistry {

    private final List<Session> sessions = new ArrayList<>();

    public void add(Session session) {
        sessions.add(session);
    }

    // An explicit iterator, because the caller needs the removed sessions (to notify their users).
    public List<Session> evictIdle(Instant now, Duration maxIdle) {
        List<Session> evicted = new ArrayList<>();
        for (Iterator<Session> it = sessions.iterator(); it.hasNext(); ) {
            Session session = it.next();
            if (session.idleAt(now, maxIdle)) {
                it.remove();
                evicted.add(session);
            }
        }
        return evicted;
    }

    // removeIf, because only the fact that something was removed matters.
    public boolean logout(String user) {
        return sessions.removeIf(session -> session.user().equals(user));
    }

    public List<Session> sessions() {
        return List.copyOf(sessions);
    }
}
