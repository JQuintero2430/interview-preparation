package dev.interview.javalanguage.m06.s04;

import java.io.Serial;

// Thrown thousands of times a second under overload; its stack trace would always be the same and is never read.
public class RateLimitedException extends RuntimeException {

    @Serial
    private static final long serialVersionUID = 1L;

    public RateLimitedException(String clientId) {
        super("rate limit exceeded for client " + clientId, null, false, false);
    }
}
