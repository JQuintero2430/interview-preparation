package dev.interview.javalanguage.m02.outputs;

import dev.interview.javalanguage.m02.s04.Customer;
import java.util.Map;
import java.util.TreeMap;

// Module 02 Q02.14: a TreeMap whose comparator looks only at the name merges two customers into one entry, keeping the
// first key and the last value.
public final class Q02_14 {

    private Q02_14() {}

    public static void main(String[] args) {
        Map<Customer, Integer> revenue = new TreeMap<>(Customer.BY_NAME);
        revenue.put(new Customer(1L, "Ana Ruiz", "Lima"), 100);
        revenue.put(new Customer(2L, "Ana Ruiz", "Bogota"), 250);
        revenue.put(new Customer(3L, "Luis Mora", "Lima"), 40);

        System.out.println(revenue.size());
        revenue.forEach((customer, total) -> System.out.println(customer.id() + " " + total));
    }
}
