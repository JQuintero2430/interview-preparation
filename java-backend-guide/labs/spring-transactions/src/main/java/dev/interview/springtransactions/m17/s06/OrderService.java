package dev.interview.springtransactions.m17.s06;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Transactional;

public class OrderService {

    private static final String INSERT_ORDER = "insert into orders (id, customer) values (?, ?)";
    // Same statement as OrderLines on purpose: placeOrder keeps the line in the order's own unit of work, with no
    // savepoint, so the example shows the plain REQUIRED outcome next to the REQUIRES_NEW audit.
    private static final String INSERT_LINE = "insert into order_line (order_id, sku, quantity) values (?, ?, ?)";
    private static final String ORDER_PLACED = "order placed";

    private final JdbcClient jdbc;
    private final AuditLog auditLog;
    private final OrderLines orderLines;

    public OrderService(JdbcClient jdbc, AuditLog auditLog, OrderLines orderLines) {
        this.jdbc = jdbc;
        this.auditLog = auditLog;
        this.orderLines = orderLines;
    }

    @Transactional
    public void placeOrder(long orderId, String customer, String sku, int quantity) {
        jdbc.sql(INSERT_ORDER).params(orderId, customer).update();
        auditLog.record(orderId, ORDER_PLACED); // REQUIRES_NEW: commits now, on a second connection
        jdbc.sql(INSERT_LINE).params(orderId, sku, quantity).update(); // a rejected line rolls back this transaction
    }

    @Transactional
    public boolean placeOrderKeepingHeader(long orderId, String customer, String sku, int quantity) {
        jdbc.sql(INSERT_ORDER).params(orderId, customer).update();
        try {
            orderLines.addLine(orderId, sku, quantity); // NESTED: a savepoint on this connection
            return true;
        } catch (DataIntegrityViolationException rejected) {
            return false; // rolled back to the savepoint; the header stays
        }
    }
}
