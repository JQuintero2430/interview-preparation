package dev.interview.javalanguage.m06.outputs;

import java.util.Collections;
import java.util.IdentityHashMap;
import java.util.Set;

// Module 06 Q06.09: walking a cause chain to its root, safely even when the chain has a cycle.
public final class Q06_09 {

    private Q06_09() {}

    public static Throwable rootCause(Throwable failure) {
        Set<Throwable> seen = Collections.newSetFromMap(new IdentityHashMap<>());
        Throwable current = failure;
        while (current.getCause() != null && seen.add(current)) {
            current = current.getCause();
        }
        return current;
    }
}
