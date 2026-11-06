package dev.interview.springtransactions.m17.ex4;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Places an order once per (client, idempotency key); a repeated request gets the first receipt back. */
@Service
public class IdempotentOrders {

    private static final String NEXT_ORDER_ID = "select nextval('order_id_seq')";
    private static final String CLAIM_KEY = "insert into order_request (client_id, idempotency_key, order_id)"
            + " values (?, ?, ?) on conflict (client_id, idempotency_key) do nothing";
    private static final String STORED_ORDER_ID =
            "select order_id from order_request where client_id = ? and idempotency_key = ?";
    private static final String INSERT_ORDER = "insert into orders (id, customer) values (?, ?)";
    private static final String INSERT_LINE = "insert into order_line (order_id, sku, quantity) values (?, ?, ?)";

    private final JdbcClient jdbc;
    private final ApplicationEventPublisher events;

    public IdempotentOrders(JdbcClient jdbc, ApplicationEventPublisher events) {
        this.jdbc = jdbc;
        this.events = events;
    }

    @Transactional
    public OrderReceipt place(PlaceOrder order) {
        long orderId = jdbc.sql(NEXT_ORDER_ID).query(Long.class).single();
        // A duplicate waits here until the first request's transaction ends, then inserts nothing.
        if (!claimed(order, orderId)) {
            return new OrderReceipt(storedOrderId(order));
        }
        jdbc.sql(INSERT_ORDER).params(orderId, order.customer()).update();
        jdbc.sql(INSERT_LINE).params(orderId, order.sku(), order.quantity()).update();
        events.publishEvent(new OrderPlaced(orderId)); // delivered to listeners after commit
        return new OrderReceipt(orderId);
    }

    private boolean claimed(PlaceOrder order, long orderId) {
        int inserted = jdbc.sql(CLAIM_KEY)
                .params(order.clientId(), order.idempotencyKey(), orderId)
                .update();
        return inserted == 1;
    }

    private long storedOrderId(PlaceOrder order) {
        return jdbc.sql(STORED_ORDER_ID)
                .params(order.clientId(), order.idempotencyKey())
                .query(Long.class)
                .single();
    }
}
