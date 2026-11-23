package dev.interview.javalanguage.m05.s10;

// Names the missing id, so the log line says what was looked up, not only that something was absent.
public final class CustomerNotFoundException extends RuntimeException {

    public CustomerNotFoundException(String id) {
        super("No customer with id " + id);
    }
}
