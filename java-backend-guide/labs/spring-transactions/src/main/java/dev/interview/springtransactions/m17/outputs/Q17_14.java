package dev.interview.springtransactions.m17.outputs;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** Q17.14: the order fails after a REQUIRES_NEW audit insert, and the audit fails under a healthy order. */
public class Q17_14 {

    private static final String INSERT_ORDER = "insert into orders (id, customer) values (?, ?)";
    private static final String CUSTOMER = "ana";
    private static final String PLACED = "placed";
    private static final String FAILURE = "payment declined";

    private final JdbcTemplate jdbc;
    private final Audit audit;

    public Q17_14(JdbcTemplate jdbc, Audit audit) {
        this.jdbc = jdbc;
        this.audit = audit;
    }

    @Transactional
    public void placeOrder(long id) {
        jdbc.update(INSERT_ORDER, id, CUSTOMER);
        audit.record(id, PLACED); // REQUIRES_NEW: committed before the next line runs
        throw new IllegalStateException(FAILURE);
    }

    @Transactional
    public void placeOrderDespiteAuditFailure(long id) {
        jdbc.update(INSERT_ORDER, id, CUSTOMER);
        try {
            audit.record(id, null); // violates "event not null" in the audit's own transaction
        } catch (DataIntegrityViolationException auditRejected) {
            // only the inner transaction rolled back; this one was suspended, not marked
        }
    }

    public static class Audit {

        private static final String INSERT_AUDIT = "insert into order_audit (order_id, event) values (?, ?)";

        private final JdbcTemplate jdbc;

        public Audit(JdbcTemplate jdbc) {
            this.jdbc = jdbc;
        }

        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public void record(long orderId, String event) {
            jdbc.update(INSERT_AUDIT, orderId, event);
        }
    }
}
