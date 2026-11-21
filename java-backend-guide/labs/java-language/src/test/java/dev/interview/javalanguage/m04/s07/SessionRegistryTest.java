package dev.interview.javalanguage.m04.s07;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SessionRegistryTest {

    private static final Instant NOW = Instant.parse("2026-11-21T12:00:00Z");
    private static final Duration MAX_IDLE = Duration.ofMinutes(30);

    private static Session session(String id, String user, int minutesAgo) {
        return new Session(id, user, NOW.minus(Duration.ofMinutes(minutesAgo)));
    }

    @Test
    @DisplayName("M04 §7 · evictIdle removes idle sessions and returns them in registry order")
    void evictIdle_removesAndReturnsIdleSessions() {
        SessionRegistry registry = new SessionRegistry();
        registry.add(session("s1", "ana", 45));
        registry.add(session("s2", "ben", 5));
        registry.add(session("s3", "ana", 31));
        registry.add(session("s4", "eve", 30));

        List<Session> evicted = registry.evictIdle(NOW, MAX_IDLE);

        assertThat(evicted).extracting(Session::id).containsExactly("s1", "s3");
        assertThat(registry.sessions()).extracting(Session::id).containsExactly("s2", "s4");
    }

    @Test
    @DisplayName("M04 §7 · evictIdle on adjacent idle sessions removes every one of them")
    void evictIdle_adjacentIdleSessions_noneSkipped() {
        SessionRegistry registry = new SessionRegistry();
        registry.add(session("s1", "ana", 40));
        registry.add(session("s2", "ben", 50));
        registry.add(session("s3", "eve", 60));

        assertThat(registry.evictIdle(NOW, MAX_IDLE)).extracting(Session::id).containsExactly("s1", "s2", "s3");
        assertThat(registry.sessions()).isEmpty();
    }

    @Test
    @DisplayName("M04 §7 · logout removes every session of a user and reports whether any existed")
    void logout_removesAllSessionsOfUser() {
        SessionRegistry registry = new SessionRegistry();
        registry.add(session("s1", "ana", 1));
        registry.add(session("s2", "ben", 2));
        registry.add(session("s3", "ana", 3));

        assertThat(registry.logout("ana")).isTrue();
        assertThat(registry.sessions()).extracting(Session::id).containsExactly("s2");
        assertThat(registry.logout("ana")).isFalse();
    }

    @Test
    @DisplayName("M04 §7 · sessions() is a snapshot that later evictions do not change and callers cannot modify")
    void sessions_isUnmodifiableSnapshot() {
        SessionRegistry registry = new SessionRegistry();
        registry.add(session("s1", "ana", 45));
        List<Session> before = registry.sessions();

        registry.evictIdle(NOW, MAX_IDLE);

        assertThat(before).extracting(Session::id).containsExactly("s1");
        assertThatThrownBy(() -> before.add(session("s9", "x", 0))).isInstanceOf(UnsupportedOperationException.class);
    }
}
