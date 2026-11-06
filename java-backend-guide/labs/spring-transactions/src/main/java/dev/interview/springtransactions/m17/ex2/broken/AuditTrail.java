package dev.interview.springtransactions.m17.ex2.broken;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

public class AuditTrail {

    private static final String INSERT_AUDIT = "insert into audit_log (order_id, action) values (?, ?)";

    private final JdbcClient jdbc;

    public AuditTrail(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(long orderId, String action) {
        jdbc.sql(INSERT_AUDIT).params(orderId, action).update();
    }
}
