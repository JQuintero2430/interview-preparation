package dev.interview.javalanguage.m05.s06;

import java.util.IntSummaryStatistics;
import java.util.List;
import java.util.OptionalDouble;

// Aggregates over primitive streams: no Integer or Long is created per line.
public final class OrderStats {

    private OrderStats() {}

    // long arithmetic before summing, so a large order cannot overflow int.
    public static long revenueCents(List<Order> orders) {
        return orders.stream()
                .flatMap(order -> order.lines().stream())
                .mapToLong(line -> line.quantity() * line.unitPriceCents())
                .sum();
    }

    // Empty, not 0.0, when there is no line to average.
    public static OptionalDouble averageUnitPriceCents(List<Order> orders) {
        return orders.stream()
                .flatMap(order -> order.lines().stream())
                .mapToLong(Line::unitPriceCents)
                .average();
    }

    // Count, min, max, sum and average in one pass.
    public static IntSummaryStatistics quantityStatistics(List<Order> orders) {
        return orders.stream()
                .flatMap(order -> order.lines().stream())
                .mapToInt(Line::quantity)
                .summaryStatistics();
    }
}
