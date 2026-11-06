package dev.interview.javalanguage.m01.s13;

import java.util.List;
import java.util.Map;
import java.util.Optional;

// Module 01 §13: findByIdentity is the defect on purpose. Long.valueOf caches -128..127, so test data with small ids
// passes while production ids above 127 silently never match; findById compares by value and has no such cliff.
public final class OrderBook {

    private static final int MISSING_QUANTITY = 0;

    public record Order(Long id, String customer) {}

    private final List<Order> orders;

    public OrderBook(List<Order> orders) {
        this.orders = List.copyOf(orders);
    }

    public Optional<Order> findByIdentity(Long id) {
        // Deliberate bug: == compares references, not values.
        return orders.stream().filter(order -> order.id() == id).findFirst();
    }

    public Optional<Order> findById(Long id) {
        return orders.stream().filter(order -> order.id().equals(id)).findFirst();
    }

    public static int quantityOf(Map<String, Integer> stock, String sku) {
        return stock.getOrDefault(sku, MISSING_QUANTITY);
    }

    public static int quantityUnboxed(Map<String, Integer> stock, String sku) {
        return stock.get(sku);
    }
}
