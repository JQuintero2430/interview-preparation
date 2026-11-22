package dev.interview.javalanguage.m05.s03;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.function.Function;
import java.util.function.IntFunction;
import java.util.function.Supplier;
import java.util.function.ToIntFunction;

// Each kind of method reference next to the lambda it stands for.
public final class MethodRefs {

    // Static: the function's arguments become the static method's arguments.
    public static final Function<String, Integer> PARSE_REF = Integer::parseInt;
    public static final Function<String, Integer> PARSE_LAMBDA = s -> Integer.parseInt(s);

    // Unbound instance: the first argument becomes the receiver.
    public static final ToIntFunction<String> LENGTH_REF = String::length;
    public static final ToIntFunction<String> LENGTH_LAMBDA = s -> s.length();
    public static final Comparator<String> IGNORE_CASE_REF = String::compareToIgnoreCase;
    public static final Comparator<String> IGNORE_CASE_LAMBDA = (a, b) -> a.compareToIgnoreCase(b);

    // Constructor and array constructor.
    public static final Supplier<List<String>> NEW_LIST_REF = ArrayList::new;
    public static final Supplier<List<String>> NEW_LIST_LAMBDA = () -> new ArrayList<>();
    public static final IntFunction<int[]> NEW_ARRAY_REF = int[]::new;
    public static final IntFunction<int[]> NEW_ARRAY_LAMBDA = size -> new int[size];

    private MethodRefs() {}

    // Bound instance: the receiver, prefix, is fixed when the reference is evaluated.
    public static Function<String, String> prefixRef(String prefix) {
        return prefix::concat;
    }

    public static Function<String, String> prefixLambda(String prefix) {
        return s -> prefix.concat(s);
    }
}
