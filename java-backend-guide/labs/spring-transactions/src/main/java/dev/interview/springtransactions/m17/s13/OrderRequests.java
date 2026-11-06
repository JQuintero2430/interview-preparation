package dev.interview.springtransactions.m17.s13;

import org.springframework.jdbc.core.simple.JdbcClient;

/** Stores each client request once, keyed by the client and its idempotency key. */
public class OrderRequests {

    private static final String INSERT =
            "insert into order_request (client_id, idempotency_key, order_id)" + " values (?, ?, ?)";
    private static final String INSERT_IF_NEW = INSERT + " on conflict (client_id, idempotency_key) do nothing";

    private final JdbcClient jdbc;

    public OrderRequests(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    /** Plain insert: a repeated key fails with the primary key's unique violation. */
    public void insert(String clientId, String idempotencyKey, long orderId) {
        jdbc.sql(INSERT).params(clientId, idempotencyKey, orderId).update();
    }

    /** Returns true when this call stored the request, false when the client already sent this key. */
    public boolean place(String clientId, String idempotencyKey, long orderId) {
        return jdbc.sql(INSERT_IF_NEW).params(clientId, idempotencyKey, orderId).update() == 1;
    }
}
