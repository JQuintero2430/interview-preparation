package dev.interview.javalanguage.m03.s07;

import java.util.HashMap;
import java.util.Map;

// Module 03 §7: the class-token version of §2's Settings. Class.cast checks the value where it leaves the map.
public final class TypedSettings {

    private final Map<String, Object> values = new HashMap<>();

    public void put(String key, Object value) {
        values.put(key, value);
    }

    public <T> T get(String key, Class<T> type) {
        return type.cast(values.get(key));
    }
}
