package dev.interview.javalanguage.m04.s08;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * A product catalog whose methods say in their return types and documentation who may change the list they return.
 * Unmodifiable results are documented as such, so a caller that wants to sort knows it must copy first; the one
 * method that hands out a mutable list returns {@code ArrayList}, a new one per call.
 */
public final class Catalog {

    private final List<Product> products;

    /** Copies {@code products}; rejects a {@code null} collection or element (List.copyOf). */
    public Catalog(Collection<Product> products) {
        this.products = List.copyOf(products);
    }

    /** Every product in catalog order. Unmodifiable. */
    public List<Product> all() {
        return products;
    }

    /** The products in stock, in catalog order. Unmodifiable: copy it before sorting or adding. */
    public List<Product> inStock() {
        return products.stream().filter(Product::inStock).toList();
    }

    /** The products in stock, cheapest first. Unmodifiable; sorted by the stream, not in place. */
    public List<Product> cheapestFirst() {
        return products.stream()
                .filter(Product::inStock)
                .sorted(Comparator.comparing(Product::price))
                .toList();
    }

    /** The products in stock, in a new {@code ArrayList} the caller owns and may change. */
    public ArrayList<Product> inStockForEditing() {
        return products.stream().filter(Product::inStock).collect(Collectors.toCollection(ArrayList::new));
    }
}
