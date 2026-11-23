package dev.interview.javalanguage.m05.ex1;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Module 05 Ex05.1: an order report. Each query is one stream pipeline ending in one collector, so the only mutable
 * state is the container that collector fills, and an empty input gives an empty result.
 */
public final class OrderReport {

    // Largest total first; equal totals in ascending customer name.
    private static final Comparator<CustomerTotal> RANKING =
            Comparator.comparingLong(CustomerTotal::totalCents).reversed().thenComparing(CustomerTotal::customer);

    // By amount, then by customer, so that two orders of the same amount still have a defined order.
    private static final Comparator<Order> BY_AMOUNT =
            Comparator.comparingLong(Order::amountCents).thenComparing(Order::customer);

    private OrderReport() {}

    // (1) Customers in name order, each with the sum of their orders.
    public static SortedMap<String, Long> totalByCustomer(List<Order> orders) {
        return orders.stream()
                .collect(Collectors.groupingBy(
                        Order::customer, TreeMap::new, Collectors.summingLong(Order::amountCents)));
    }

    // (2) Every known category starts at 0; each order adds 1 to its category, known or not.
    public static SortedMap<String, Long> countByCategory(List<Order> orders, Collection<String> knownCategories) {
        return Stream.concat(
                        knownCategories.stream().map(category -> Map.entry(category, 0L)),
                        orders.stream().map(order -> Map.entry(order.category(), 1L)))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, Long::sum, TreeMap::new));
    }

    // (3) Totals per customer, then the first `limit` rows of the ranking.
    public static List<CustomerTotal> topCustomers(List<Order> orders, int limit) {
        return orders.stream()
                .collect(Collectors.collectingAndThen(
                        Collectors.groupingBy(Order::customer, Collectors.summingLong(Order::amountCents)),
                        totals -> totals.entrySet().stream()
                                .map(total -> new CustomerTotal(total.getKey(), total.getValue()))
                                .sorted(RANKING)
                                .limit(limit)
                                .toList()));
    }

    // (4) true: at or above the threshold (large); false: below it (small). Both keys are always present.
    public static Map<Boolean, List<Order>> partitionBySize(List<Order> orders, long largeFromCents) {
        return orders.stream().collect(Collectors.partitioningBy(order -> order.amountCents() >= largeFromCents));
    }

    // (5) Minimum and maximum in one pass; empty when there are no orders.
    public static Optional<OrderRange> range(List<Order> orders) {
        return orders.stream()
                .collect(Collectors.teeing(
                        Collectors.minBy(BY_AMOUNT),
                        Collectors.maxBy(BY_AMOUNT),
                        (smallest, largest) ->
                                smallest.flatMap(low -> largest.map(high -> new OrderRange(low, high)))));
    }
}
