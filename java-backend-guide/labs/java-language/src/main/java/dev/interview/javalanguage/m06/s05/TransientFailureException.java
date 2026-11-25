package dev.interview.javalanguage.m06.s05;

import java.io.Serial;

// A failure that may succeed if the same message is delivered again later.
public class TransientFailureException extends RuntimeException {

    @Serial
    private static final long serialVersionUID = 1L;

    public TransientFailureException(String message, Throwable cause) {
        super(message, cause);
    }
}
