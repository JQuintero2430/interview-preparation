package dev.interview.springtransactions.m17.s05;

import org.springframework.transaction.annotation.Transactional;

public class CheckoutFlow {

    private final InventoryService inventory;

    public CheckoutFlow(InventoryService inventory) {
        this.inventory = inventory;
    }

    @Transactional
    public String placeOrder(String sku) {
        try {
            inventory.reserve(sku); // joins this transaction (REQUIRED) and fails
        } catch (IllegalStateException ex) {
            return "backordered"; // swallowing it does not undo the rollback-only mark
        }
        return "reserved";
    }
}
