package dev.interview.javalanguage.m02.s04;

import java.util.Comparator;
import java.util.Objects;

/** Module 02 §4: a customer with comparators built by chaining, including a nullable city ordered last. */
public record Customer(long id, String name, String city) {

    public static final Comparator<Customer> BY_NAME = Comparator.comparing(Customer::name);

    public static final Comparator<Customer> BY_NAME_THEN_ID = BY_NAME.thenComparingLong(Customer::id);

    public static final Comparator<Customer> BY_CITY_NULLS_LAST_THEN_NAME = Comparator.comparing(
                    Customer::city, Comparator.nullsLast(Comparator.<String>naturalOrder()))
            .thenComparing(BY_NAME_THEN_ID);

    public Customer {
        Objects.requireNonNull(name);
    }
}
