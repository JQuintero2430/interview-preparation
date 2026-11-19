package dev.interview.javalanguage.m03.s07;

import java.util.List;

// Module 03 §7: defect on purpose. Inside a generic method the token can only record the type variable T,
// so every caller gets List<T>, whatever type it asked for.
public final class GenericTokens {

    private GenericTokens() {}

    public static <T> TypeToken<List<T>> listOf() {
        return new TypeToken<>() {};
    }
}
