package dev.interview.javalanguage.m03.outputs;

import dev.interview.javalanguage.m03.ex3.TypeRef;
import java.util.HashMap;
import java.util.Map;

// Module 03 Q03.24: a context keyed by super type tokens. It can hold List<String> and List<Integer> apart, but it
// cannot check a value against List<String> at run time, so get needs an unchecked cast.
public final class Q03_24 {

    private final Map<TypeRef<?>, Object> values = new HashMap<>();

    public <T> void put(TypeRef<T> key, T value) {
        values.put(key, value);
    }

    @SuppressWarnings("unchecked") // List<String> erases to List: no Class object can check the elements here
    public <T> T get(TypeRef<T> key) {
        return (T) values.get(key);
    }
}
