package dev.interview.javalanguage.m05.outputs;

import java.util.List;

// Module 05 Q05.18: a seed that is not an identity is added once per parallel chunk.
public final class Q05_18 {

    private Q05_18() {}

    // Bug: the fee is used as the identity, so a parallel stream adds it once per chunk.
    public static int totalWithFeeBuggy(List<Integer> amounts, int fee) {
        return amounts.parallelStream().reduce(fee, Integer::sum);
    }

    // Fix: reduce with the true identity of +, then apply the fee once.
    public static int totalWithFee(List<Integer> amounts, int fee) {
        return amounts.parallelStream().reduce(0, Integer::sum) + fee;
    }
}
