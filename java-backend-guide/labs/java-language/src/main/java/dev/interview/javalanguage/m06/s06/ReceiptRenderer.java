package dev.interview.javalanguage.m06.s06;

import java.util.List;
import java.util.stream.Collectors;

public final class ReceiptRenderer {

    private static final String HEADER = """
            RECEIPT
            -------
            """;

    private ReceiptRenderer() {}

    // One builder for the whole loop: + inside the loop would build a new String on every iteration.
    public static String render(List<LineItem> items) {
        StringBuilder out = new StringBuilder(HEADER);
        int total = 0;
        for (LineItem item : items) {
            out.append(item.name()).append(" x").append(item.quantity()).append('\n');
            total += item.quantity();
        }
        return out.append("items: ").append(total).append('\n').toString();
    }

    // A separator between elements, none at the ends: joining does the bookkeeping.
    public static String names(List<LineItem> items) {
        return items.stream().map(LineItem::name).collect(Collectors.joining(", "));
    }
}
