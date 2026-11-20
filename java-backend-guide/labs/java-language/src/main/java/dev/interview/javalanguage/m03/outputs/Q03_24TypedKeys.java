package dev.interview.javalanguage.m03.outputs;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

// Module 03 Q03.24: the middle column. A typed key carries a name and a Class, so one type can have several entries
// and every value is still checked at put by Class.cast.
public final class Q03_24TypedKeys {

    public record Key<T>(String name, Class<T> type) {
        public Key {
            Objects.requireNonNull(name, "name");
            Objects.requireNonNull(type, "type");
        }
    }

    private final Map<Key<?>, Object> values = new HashMap<>();

    public <T> void put(Key<T> key, T value) {
        values.put(key, key.type().cast(value));
    }

    public <T> T get(Key<T> key) {
        return key.type().cast(values.get(key));
    }
}
