package dev.interview.springtransactions.m17.s06;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

public class AuditLog {

    private static final String INSERT_AUDIT = "insert into audit_log (order_id, action) values (?, ?)";

    private final JdbcClient jdbc;

    public AuditLog(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    // REQUIRES_NEW: the audit row must outlive a failed order, at the price of a second pooled connection per call.
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(long orderId, String action) {
        jdbc.sql(INSERT_AUDIT).params(orderId, action).update();
    }
}
