package dev.interview.javalanguage.m05.s10;

import java.util.Optional;

// A lookup that may find nothing: the return type says so, instead of a null the caller may forget.
@FunctionalInterface
public interface CustomerLookup {

    Optional<Customer> findById(String id);
}
