package dev.interview.springtransactions.m17.outputs;

import org.springframework.transaction.annotation.Transactional;

/** Q17.10: the caller catches the failure of an inner REQUIRED method and carries on. */
public class Q17_10 {

    private static final String RESERVED = "reserved";
    private static final String BACKORDERED = "backordered";

    private final Inventory inventory;

    public Q17_10(Inventory inventory) {
        this.inventory = inventory;
    }

    @Transactional
    public String placeOrder(String sku) {
        try {
            inventory.reserve(sku); // REQUIRED: joins this transaction, then fails
        } catch (IllegalStateException outOfStock) {
            return BACKORDERED; // the shared transaction is already marked rollback-only
        }
        return RESERVED;
    }

    public static class Inventory {

        @Transactional
        public void reserve(String sku) {
            throw new IllegalStateException("out of stock: " + sku);
        }
    }
}
