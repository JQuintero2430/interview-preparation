package dev.interview.javalanguage.m04.outputs;

import java.util.Arrays;

// Module 04 Q04.28: Arrays.asList(int[]) is a List<int[]> with one element.
public final class Q04_28 {

    private Q04_28() {}

    // The review snippet: is code one of the allowed codes?
    public static boolean isAllowedBuggy(int[] allowedCodes, int code) {
        return Arrays.asList(allowedCodes).contains(code);
    }

    // The fix: search the int[] as ints; no boxing, no List.
    public static boolean isAllowedFixed(int[] allowedCodes, int code) {
        return Arrays.stream(allowedCodes).anyMatch(allowed -> allowed == code);
    }
}
