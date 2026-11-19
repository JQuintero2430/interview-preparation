package dev.interview.javalanguage.m03.s06;

import java.util.List;

// Module 03 §6: defect on purpose. The varargs array is a List[] at run time, so storing a List<Integer>
// through an Object[] view passes the array store check, and the failure moves to the String read.
public final class VarargsPollution {

    private static final Integer NOT_A_STRING = 42;

    private VarargsPollution() {}

    @SafeVarargs // A lie on purpose: the body stores into the array, which is what @SafeVarargs promises not to do.
    public static String firstElement(List<String>... lists) {
        Object[] view = lists;
        view[0] = List.of(NOT_A_STRING);
        return lists[0].get(0);
    }
}
