package dev.interview.javalanguage.m03.s06;

import java.lang.reflect.Array;

// Module 03 §6: a class token gives a generic method a real T[] instead of an Object[] in disguise.
public final class TypedArrays {

    private TypedArrays() {}

    @SuppressWarnings("unchecked") // Array.newInstance(type, n) creates an array whose component type is T.
    public static <T> T[] newArray(Class<T> type, int length) {
        return (T[]) Array.newInstance(type, length);
    }
}
