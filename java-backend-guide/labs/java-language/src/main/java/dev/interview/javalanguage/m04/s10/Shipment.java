package dev.interview.javalanguage.m04.s10;

import java.time.Instant;
import java.util.Objects;

/** A shipment identified by its id, due at a point in time. */
public record Shipment(String id, Instant due) {

    public Shipment {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(due, "due");
    }
}
