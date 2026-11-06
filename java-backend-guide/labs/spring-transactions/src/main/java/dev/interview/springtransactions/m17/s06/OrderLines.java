package dev.interview.springtransactions.m17.s06;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

public class OrderLines {

    private static final String INSERT_LINE = "insert into order_line (order_id, sku, quantity) values (?, ?, ?)";

    private final JdbcClient jdbc;

    public OrderLines(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    // NESTED: a rejected line may be undone alone, on the caller's connection, without dooming the order header.
    @Transactional(propagation = Propagation.NESTED)
    public void addLine(long orderId, String sku, int quantity) {
        jdbc.sql(INSERT_LINE).params(orderId, sku, quantity).update();
    }
}
