package dev.interview.javalanguage.m02.ex2;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/** Module 02 Ex02.2: an immutable order; the builder collects the fields, the compact constructor copies and checks. */
public record Order(String id, String customer, Status status, List<Line> lines) {

    private static final String ID = "id";
    private static final String CUSTOMER = "customer";
    private static final String STATUS = "status";
    private static final String MISSING_FIELD = "missing required field: %s";

    /** Lifecycle states of an order. */
    public enum Status {
        NEW,
        PAID,
        SHIPPED
    }

    /** One product and how many units of it. */
    public record Line(String sku, int quantity) {}

    public Order {
        Objects.requireNonNull(id, ID);
        Objects.requireNonNull(customer, CUSTOMER);
        Objects.requireNonNull(status, STATUS);
        // Every path to an Order ends here (builder, withers, direct call), so this is the only copy needed.
        lines = List.copyOf(lines);
    }

    public static Builder builder() {
        return new Builder();
    }

    public Order withStatus(Status newStatus) {
        return new Order(id, customer, newStatus, lines);
    }

    public Order withLine(Line line) {
        List<Line> extended = new ArrayList<>(lines);
        extended.add(line);
        return new Order(id, customer, status, extended);
    }

    /** Mutable and reusable: each build() hands the current state to the canonical constructor. */
    public static final class Builder {

        private String id;
        private String customer;
        private Status status = Status.NEW;
        private List<Line> lines = List.of();

        private Builder() {}

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder customer(String customer) {
            this.customer = customer;
            return this;
        }

        public Builder status(Status status) {
            this.status = status;
            return this;
        }

        public Builder lines(List<Line> lines) {
            this.lines = lines;
            return this;
        }

        public Order build() {
            require(id, ID);
            require(customer, CUSTOMER);
            return new Order(id, customer, status, lines);
        }

        private static void require(Object value, String field) {
            if (value == null) {
                throw new IllegalStateException(MISSING_FIELD.formatted(field));
            }
        }
    }
}
