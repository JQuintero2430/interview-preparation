package dev.interview.springtransactions.m17.ex2;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

public class AuditTrail {

    private static final String INSERT_AUDIT = "insert into audit_log (order_id, action) values (?, ?)";

    private final JdbcClient jdbc;

    public AuditTrail(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    // NEVER: the insert auto-commits on one connection, and a call from inside a transaction fails at once
    // instead of quietly borrowing a second connection.
    @Transactional(propagation = Propagation.NEVER)
    public void record(long orderId, String action) {
        jdbc.sql(INSERT_AUDIT).params(orderId, action).update();
    }
}
