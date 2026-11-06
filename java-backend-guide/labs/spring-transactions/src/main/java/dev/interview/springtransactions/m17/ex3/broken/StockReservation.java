package dev.interview.springtransactions.m17.ex3.broken;

import dev.interview.springtransactions.m17.ex3.OutOfStockException;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Transactional;

/** Starting code of Exercise 17.3: two callers can read the same count, and the second write erases the first. */
public class StockReservation {

    private static final String READ_AVAILABLE = "select available from stock_item where id = ?";
    private static final String WRITE_AVAILABLE = "update stock_item set available = ? where id = ?";

    private final JdbcClient jdbc;

    public StockReservation(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    public void reserve(long itemId, int units) {
        int available =
                jdbc.sql(READ_AVAILABLE).param(itemId).query(Integer.class).single();
        if (units > available) {
            throw new OutOfStockException(itemId, units, available);
        }
        jdbc.sql(WRITE_AVAILABLE).params(available - units, itemId).update();
    }
}
