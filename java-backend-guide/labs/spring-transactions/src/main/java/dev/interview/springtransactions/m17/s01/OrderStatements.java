package dev.interview.springtransactions.m17.s01;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/** The two inserts of an order, with values bound as parameters. */
public final class OrderStatements {

    private OrderStatements() {}

    public static void insertOrder(Connection connection, long id, String customer) throws SQLException {
        try (PreparedStatement insert =
                connection.prepareStatement("insert into orders (id, customer) values (?, ?)")) {
            insert.setLong(1, id);
            insert.setString(2, customer);
            insert.executeUpdate();
        }
    }

    public static void insertLine(Connection connection, long orderId, String sku, int quantity) throws SQLException {
        try (PreparedStatement insert =
                connection.prepareStatement("insert into order_line (order_id, sku, quantity) values (?, ?, ?)")) {
            insert.setLong(1, orderId);
            insert.setString(2, sku);
            insert.setInt(3, quantity);
            insert.executeUpdate();
        }
    }

    public static void placeOrder(Connection connection, long id, String customer, String sku, int quantity)
            throws SQLException {
        insertOrder(connection, id, customer);
        insertLine(connection, id, sku, quantity);
    }
}
