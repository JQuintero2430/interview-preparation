package dev.interview.springtransactions.m17.ex2.broken;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Transactional;

/** Starting code of Exercise 17.2: the audit borrows a second connection while the order holds the first. */
public class CheckoutService {

    private static final String INSERT_ORDER = "insert into orders (id, customer) values (?, ?)";
    private static final String INSERT_LINE = "insert into order_line (order_id, sku, quantity) values (?, ?, ?)";

    private final JdbcClient jdbc;
    private final AuditTrail auditTrail;

    public CheckoutService(JdbcClient jdbc, AuditTrail auditTrail) {
        this.jdbc = jdbc;
        this.auditTrail = auditTrail;
    }

    @Transactional
    public void checkout(long orderId, String customer, String sku, int quantity) {
        jdbc.sql(INSERT_ORDER).params(orderId, customer).update();
        auditTrail.record(orderId, "order placed");
        jdbc.sql(INSERT_LINE).params(orderId, sku, quantity).update();
    }
}
