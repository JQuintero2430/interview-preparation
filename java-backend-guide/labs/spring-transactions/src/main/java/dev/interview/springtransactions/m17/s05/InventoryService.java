package dev.interview.springtransactions.m17.s05;

import org.springframework.transaction.annotation.Transactional;

public class InventoryService {

    @Transactional
    public void reserve(String sku) {
        throw new IllegalStateException("out of stock: " + sku);
    }
}
