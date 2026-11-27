package dev.interview.javalanguage.m06.ex3;

import java.io.Serial;

// Checked: a cache entry that cannot be read is an expected failure the caller must decide about.
public abstract sealed class SessionDecodingException extends Exception
        permits RejectedSessionException, IncompatibleSessionException, CorruptSessionException {

    @Serial
    private static final long serialVersionUID = 1L;

    SessionDecodingException(String message, Throwable cause) {
        super(message, cause);
    }
}
