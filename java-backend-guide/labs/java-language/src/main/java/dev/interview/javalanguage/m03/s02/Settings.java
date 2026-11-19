package dev.interview.javalanguage.m03.s02;

import java.util.HashMap;
import java.util.Map;

// Module 03 §2: the defect on purpose. T appears only in the return type, so the caller picks it and nothing checks it.
public final class Settings {

    private final Map<String, Object> values = new HashMap<>();

    public void put(String key, Object value) {
        values.put(key, value);
    }

    @SuppressWarnings("unchecked")
    public <T> T get(String key) {
        return (T) values.get(key);
    }
}
