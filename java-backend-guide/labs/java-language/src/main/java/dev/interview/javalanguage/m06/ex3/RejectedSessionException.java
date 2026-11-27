package dev.interview.javalanguage.m06.ex3;

import java.io.Serial;

// The bytes asked for something the allow-list or its limits forbid: treat as hostile, not as a miss.
public final class RejectedSessionException extends SessionDecodingException {

    @Serial
    private static final long serialVersionUID = 1L;

    RejectedSessionException(String reason, Throwable cause) {
        super("session payload rejected: " + reason, cause);
    }
}
