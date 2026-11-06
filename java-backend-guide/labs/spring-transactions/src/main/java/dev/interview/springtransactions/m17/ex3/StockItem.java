package dev.interview.springtransactions.m17.ex3;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Version;

/** Units of one item that can still be reserved; {@code version} turns a lost update into a failed commit. */
@Entity
public class StockItem {

    @Id
    private Long id;

    private int available;

    @Version
    private long version;

    protected StockItem() {}

    public void reserve(int units) {
        if (units > available) {
            throw new OutOfStockException(id, units, available);
        }
        available -= units;
    }
}
