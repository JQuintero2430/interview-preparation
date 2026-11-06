package dev.interview.springtransactions.m17.s10;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Version;

/** A stock row with a version column: Hibernate checks and increments {@code version} on every update. */
@Entity
public class Stock {

    @Id
    private Long id;

    private int quantity;

    @Version
    private long version;

    protected Stock() {}

    public void remove(int units) {
        quantity -= units;
    }
}
