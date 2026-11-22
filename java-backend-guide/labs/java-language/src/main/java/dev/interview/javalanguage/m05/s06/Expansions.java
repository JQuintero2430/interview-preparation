package dev.interview.javalanguage.m05.s06;

import java.util.List;

// One order becomes zero or more lines: the same expansion written with flatMap and with mapMulti.
public final class Expansions {

    private Expansions() {}

    // flatMap: return a stream for each order; the pipeline consumes and closes it.
    public static List<Line> shippableLinesWithFlatMap(List<Order> orders) {
        return orders.stream()
                .flatMap(order -> order.lines().stream().filter(line -> line.quantity() > 0))
                .toList();
    }

    // mapMulti: push each kept line to the consumer; no stream per order.
    public static List<Line> shippableLinesWithMapMulti(List<Order> orders) {
        return orders.stream()
                .<Line>mapMulti((order, downstream) -> {
                    for (Line line : order.lines()) {
                        if (line.quantity() > 0) {
                            downstream.accept(line);
                        }
                    }
                })
                .toList();
    }

    // The Stream.mapMulti Javadoc example: keep one subtype, already cast.
    public static List<Integer> onlyIntegers(List<Object> values) {
        return values.stream()
                .<Integer>mapMulti((value, downstream) -> {
                    if (value instanceof Integer i) {
                        downstream.accept(i);
                    }
                })
                .toList();
    }
}
