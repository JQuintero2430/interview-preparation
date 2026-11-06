package dev.interview.springtransactions.m17.s13;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.support.TransactionOperations;

/** The same checkout with the remote call inside the transaction and outside it. */
public class Checkout {

    private static final String INSERT_ORDER = "insert into orders (id, customer) values (?, ?)";

    private final TransactionOperations transactions;
    private final JdbcClient jdbc;
    private final PaymentGateway gateway;

    public Checkout(TransactionOperations transactions, JdbcClient jdbc, PaymentGateway gateway) {
        this.transactions = transactions;
        this.jdbc = jdbc;
        this.gateway = gateway;
    }

    /** Anti-pattern: the pooled connection stays checked out for as long as the gateway takes to answer. */
    public void payInsideTransaction(long orderId, String customer) {
        transactions.executeWithoutResult(status -> {
            insertOrder(orderId, customer);
            gateway.charge(orderId);
        });
    }

    /** The remote call holds no connection; the transaction covers only the write. */
    public void payThenRecord(long orderId, String customer) {
        gateway.charge(orderId);
        transactions.executeWithoutResult(status -> insertOrder(orderId, customer));
    }

    private void insertOrder(long orderId, String customer) {
        jdbc.sql(INSERT_ORDER).params(orderId, customer).update();
    }
}
