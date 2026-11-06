package dev.interview.springtransactions.m17.outputs;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

/** Q17.03: one write through the managed DataSource, one through a DataSource the manager does not know. */
public class Q17_03 {

    private static final String INSERT_ORDER = "insert into orders (id, customer) values (?, ?)";
    private static final String INSERT_AUDIT = "insert into order_audit (order_id, event) values (?, ?)";
    private static final String CUSTOMER = "ana";
    private static final String EVENT = "placed";
    private static final String FAILURE = "payment declined";

    private final JdbcTemplate orders; // its DataSource is the transaction manager's
    private final JdbcTemplate audit; // a second DataSource on the same database

    public Q17_03(JdbcTemplate orders, JdbcTemplate audit) {
        this.orders = orders;
        this.audit = audit;
    }

    @Transactional
    public void placeOrder(long id) {
        orders.update(INSERT_ORDER, id, CUSTOMER);
        audit.update(INSERT_AUDIT, id, EVENT);
        throw new IllegalStateException(FAILURE);
    }
}
