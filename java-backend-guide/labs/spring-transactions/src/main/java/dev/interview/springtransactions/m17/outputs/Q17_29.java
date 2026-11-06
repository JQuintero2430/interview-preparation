package dev.interview.springtransactions.m17.outputs;

import java.util.concurrent.CompletableFuture;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** Q17.29: an @Async @Transactional method called from inside a transaction that has just inserted a row. */
public class Q17_29 {

    private static final String INSERT_ORDER = "insert into orders (id, customer) values (?, ?)";
    private static final String CUSTOMER = "ana";

    private final JdbcTemplate jdbc;
    private final Invoices invoices;

    public Q17_29(JdbcTemplate jdbc, Invoices invoices) {
        this.jdbc = jdbc;
        this.invoices = invoices;
    }

    @Transactional
    public Seen placeOrderAndWait(long id) {
        jdbc.update(INSERT_ORDER, id, CUSTOMER);
        return invoices.countOrders(id).join(); // waits inside this transaction, before its commit
    }

    @Transactional
    public CompletableFuture<Seen> placeOrder(long id) {
        jdbc.update(INSERT_ORDER, id, CUSTOMER);
        return invoices.countOrders(id); // fire and forget: races with this transaction's commit
    }

    public record Seen(String transaction, long orders) {}

    public static class Invoices {

        private static final String COUNT_ORDER = "select count(*) from orders where id = ?";

        private final JdbcTemplate jdbc;

        public Invoices(JdbcTemplate jdbc) {
            this.jdbc = jdbc;
        }

        @Async
        @Transactional(readOnly = true)
        public CompletableFuture<Seen> countOrders(long id) {
            Long orders = jdbc.queryForObject(COUNT_ORDER, Long.class, id);
            return CompletableFuture.completedFuture(
                    new Seen(TransactionSynchronizationManager.getCurrentTransactionName(), orders));
        }
    }
}
