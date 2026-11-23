package dev.interview.javalanguage.m05.ex2;

/**
 * Module 05 Ex05.2: the mutable container behind {@link Stats#collector()}. The stream gives each chunk its own
 * instance and never shares one between threads, so it needs no synchronization.
 */
final class StatsAccumulator {

    private long count;
    private long sum;
    // Identity values: any real value replaces them, and merging an empty container changes nothing.
    private long min = Long.MAX_VALUE;
    private long max = Long.MIN_VALUE;

    void add(long value) {
        count++;
        sum += value;
        min = Math.min(min, value);
        max = Math.max(max, value);
    }

    StatsAccumulator merge(StatsAccumulator right) {
        count += right.count;
        sum += right.sum;
        min = Math.min(min, right.min);
        max = Math.max(max, right.max);
        return this;
    }

    Stats toStats() {
        return count == 0 ? new Stats.Empty() : new Stats.NonEmpty(count, sum, min, max);
    }
}
