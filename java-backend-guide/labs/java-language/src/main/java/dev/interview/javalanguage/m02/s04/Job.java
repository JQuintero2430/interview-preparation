package dev.interview.javalanguage.m02.s04;

import java.util.Comparator;

/** Module 02 §4: a job whose two comparators show the subtraction overflow defect next to its fix. */
public record Job(String name, int priority) {

    // Kept on purpose as a teaching defect: the difference overflows for large magnitudes, so it misorders MIN_VALUE.
    public static final Comparator<Job> BY_PRIORITY_SUBTRACTION = (a, b) -> a.priority() - b.priority();

    public static final Comparator<Job> BY_PRIORITY = Comparator.comparingInt(Job::priority);
}
