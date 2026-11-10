package dev.interview.javalanguage.m02.s06;

import java.util.Locale;
import java.util.Objects;

/** Module 02 §6: a compact constructor normalizes the parameters before the generated assignment runs. */
public record Email(String value) {

    private static final String VALUE = "value";
    private static final String AT = "@";
    private static final String NOT_AN_EMAIL = "not an email: ";

    public Email {
        Objects.requireNonNull(value, VALUE);
        value = value.strip().toLowerCase(Locale.ROOT);
        if (!value.contains(AT)) {
            throw new IllegalArgumentException(NOT_AN_EMAIL + value);
        }
    }
}
