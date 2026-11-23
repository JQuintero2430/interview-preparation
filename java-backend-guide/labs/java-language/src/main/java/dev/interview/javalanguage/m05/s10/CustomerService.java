package dev.interview.javalanguage.m05.s10;

import java.util.List;
import java.util.Optional;

// Consumes Optional results without isPresent()/get(): each method states what "absent" turns into.
public final class CustomerService {

    private final CustomerLookup primary;
    private final CustomerLookup fallback;

    public CustomerService(CustomerLookup primary, CustomerLookup fallback) {
        this.primary = primary;
        this.fallback = fallback;
    }

    // Absent becomes a default value: the default is a constant, so orElse is fine here.
    public String displayName(String id) {
        return primary.findById(id).map(Customer::name).orElse("guest");
    }

    // The referrer lookup already returns Optional, so flatMap keeps one level: Optional<Customer>.
    public Optional<Customer> referrerOf(String id) {
        return primary.findById(id).flatMap(Customer::referrer).flatMap(primary::findById);
    }

    // The fallback is queried only when the primary finds nothing (or takes a Supplier, so it is lazy).
    public Optional<Customer> findAnywhere(String id) {
        return primary.findById(id).or(() -> fallback.findById(id));
    }

    // Absent is an error for this caller: say which id, instead of get()'s "No value present".
    public Customer require(String id) {
        return findAnywhere(id).orElseThrow(() -> new CustomerNotFoundException(id));
    }

    // Optional::stream turns each result into zero or one elements, so missing ids simply drop out.
    public List<String> namesOf(List<String> ids) {
        return ids.stream()
                .map(primary::findById)
                .flatMap(Optional::stream)
                .map(Customer::name)
                .toList();
    }
}
