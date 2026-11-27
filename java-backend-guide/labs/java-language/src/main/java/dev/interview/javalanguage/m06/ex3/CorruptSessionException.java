package dev.interview.javalanguage.m06.ex3;

import java.io.Serial;

// Allowed classes, but not a valid session: truncated bytes or fields that break the session's invariants.
public final class CorruptSessionException extends SessionDecodingException {

    @Serial
    private static final long serialVersionUID = 1L;

    CorruptSessionException(Throwable cause) {
        super("corrupt session payload: " + cause.getMessage(), cause);
    }
}
