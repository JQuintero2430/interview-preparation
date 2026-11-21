package dev.interview.javalanguage.m04.s09;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

/**
 * Scores in arrival order, ranked on demand. The ranking relies on {@code List.sort} being stable, so players with
 * equal points stay in the order they submitted; the tier lookup relies on the insertion point that
 * {@code Arrays.binarySearch} returns for an absent key. Not thread-safe (module 12).
 */
public final class Leaderboard {

    private static final Comparator<Score> BY_POINTS_DESC =
            Comparator.comparingInt(Score::points).reversed();

    // Sorted ascending and distinct, as binarySearch requires; TIERS[i] starts at THRESHOLDS[i].
    private static final int[] THRESHOLDS = {0, 100, 500, 1_000};
    private static final String[] TIERS = {"bronze", "silver", "gold", "platinum"};

    private final List<Score> arrivals = new ArrayList<>();

    public void submit(Score score) {
        arrivals.add(score);
    }

    public List<Score> arrivals() {
        return List.copyOf(arrivals);
    }

    // Sort a copy, so arrival order survives; the stable sort keeps ties in arrival order.
    public List<Score> standings() {
        List<Score> ranked = new ArrayList<>(arrivals);
        ranked.sort(BY_POINTS_DESC);
        return List.copyOf(ranked);
    }

    // A hit is the tier's own threshold; a miss returns -(insertion point) - 1, and the tier is the one before.
    public String tierOf(int points) {
        if (points < 0) {
            throw new IllegalArgumentException("points must not be negative: " + points);
        }
        int found = Arrays.binarySearch(THRESHOLDS, points);
        int index = found >= 0 ? found : -found - 2;
        return TIERS[index];
    }
}
