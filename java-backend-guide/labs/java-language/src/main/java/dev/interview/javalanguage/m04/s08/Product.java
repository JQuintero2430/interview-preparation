package dev.interview.javalanguage.m04.s08;

import java.math.BigDecimal;
import java.util.Objects;

/** A catalog entry. */
public record Product(String sku, BigDecimal price, boolean inStock) {

    public Product {
        Objects.requireNonNull(sku, "sku");
        Objects.requireNonNull(price, "price");
    }
}
