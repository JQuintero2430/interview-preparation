package dev.interview.javalanguage.m02.s06;

import java.util.Arrays;
import java.util.Objects;

/** Module 02 §6: the fix: copy in, copy out, and compare the array by content. */
public record Event(String id, byte[] payload) {

    private static final String ID = "id";
    private static final String PAYLOAD = "payload";
    private static final String FORMAT = "Event[id=%s, payload=%d bytes]";

    public Event {
        Objects.requireNonNull(id, ID);
        Objects.requireNonNull(payload, PAYLOAD);
        payload = payload.clone();
    }

    @Override
    public byte[] payload() {
        return payload.clone();
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof Event other && id.equals(other.id) && Arrays.equals(payload, other.payload);
    }

    @Override
    public int hashCode() {
        return 31 * id.hashCode() + Arrays.hashCode(payload);
    }

    @Override
    public String toString() {
        return FORMAT.formatted(id, payload.length);
    }
}
