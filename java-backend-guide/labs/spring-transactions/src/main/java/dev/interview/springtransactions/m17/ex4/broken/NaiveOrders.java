package dev.interview.springtransactions.m17.ex4.broken;

import dev.interview.springtransactions.m17.ex4.ConfirmationChannel;
import dev.interview.springtransactions.m17.ex4.PlaceOrder;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Transactional;

/** Starting code of Exercise 17.4: a retry places a second order, and the e-mail leaves before the commit. */
public class NaiveOrders {

    private static final String NEXT_ORDER_ID = "select nextval('order_id_seq')";
    private static final String INSERT_ORDER = "insert into orders (id, customer) values (?, ?)";
    private static final String INSERT_LINE = "insert into order_line (order_id, sku, quantity) values (?, ?, ?)";

    private final JdbcClient jdbc;
    private final ConfirmationChannel channel;

    public NaiveOrders(JdbcClient jdbc, ConfirmationChannel channel) {
        this.jdbc = jdbc;
        this.channel = channel;
    }

    @Transactional
    public long place(PlaceOrder order) {
        long orderId = jdbc.sql(NEXT_ORDER_ID).query(Long.class).single();
        jdbc.sql(INSERT_ORDER).params(orderId, order.customer()).update();
        channel.send(orderId); // sent even if the next insert rolls the order back
        jdbc.sql(INSERT_LINE).params(orderId, order.sku(), order.quantity()).update();
        return orderId;
    }
}
