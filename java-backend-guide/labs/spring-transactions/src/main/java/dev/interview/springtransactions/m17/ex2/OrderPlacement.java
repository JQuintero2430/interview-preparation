package dev.interview.springtransactions.m17.ex2;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Transactional;

public class OrderPlacement {

    private static final String INSERT_ORDER = "insert into orders (id, customer) values (?, ?)";
    private static final String INSERT_LINE = "insert into order_line (order_id, sku, quantity) values (?, ?, ?)";

    private final JdbcClient jdbc;

    public OrderPlacement(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    public void place(long orderId, String customer, String sku, int quantity) {
        jdbc.sql(INSERT_ORDER).params(orderId, customer).update();
        jdbc.sql(INSERT_LINE).params(orderId, sku, quantity).update(); // a rejected line rolls back the order
    }
}
