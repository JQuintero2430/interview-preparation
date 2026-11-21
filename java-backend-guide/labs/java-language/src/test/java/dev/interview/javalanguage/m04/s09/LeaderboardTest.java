package dev.interview.javalanguage.m04.s09;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class LeaderboardTest {

    @Test
    @DisplayName("M04 §9 · standings order by points, highest first, and ties keep arrival order")
    void standings_sortedByPoints_tiesInArrivalOrder() {
        Leaderboard board = new Leaderboard();
        board.submit(new Score("ana", 120));
        board.submit(new Score("ben", 300));
        board.submit(new Score("eve", 120));
        board.submit(new Score("joe", 300));

        assertThat(board.standings()).extracting(Score::player).containsExactly("ben", "joe", "ana", "eve");
    }

    @Test
    @DisplayName("M04 §9 · standings is an unmodifiable copy and arrival order is kept")
    void standings_isUnmodifiableCopy() {
        Leaderboard board = new Leaderboard();
        board.submit(new Score("ana", 10));
        board.submit(new Score("ben", 20));

        assertThat(board.standings()).extracting(Score::player).containsExactly("ben", "ana");
        assertThat(board.arrivals()).extracting(Score::player).containsExactly("ana", "ben");
        assertThatThrownBy(() -> board.standings().clear()).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("M04 §9 · tierOf finds the highest threshold not above the points")
    void tierOf_floorLookup() {
        Leaderboard board = new Leaderboard();

        assertThat(board.tierOf(0)).isEqualTo("bronze");
        assertThat(board.tierOf(99)).isEqualTo("bronze");
        assertThat(board.tierOf(100)).isEqualTo("silver");
        assertThat(board.tierOf(499)).isEqualTo("silver");
        assertThat(board.tierOf(500)).isEqualTo("gold");
        assertThat(board.tierOf(1_000)).isEqualTo("platinum");
        assertThat(board.tierOf(Integer.MAX_VALUE)).isEqualTo("platinum");
    }

    @Test
    @DisplayName("M04 §9 · negative points are rejected")
    void negativePoints_rejected() {
        Leaderboard board = new Leaderboard();

        assertThatThrownBy(() -> board.tierOf(-1)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new Score("ana", -5)).isInstanceOf(IllegalArgumentException.class);
    }
}
