package dev.interview.javalanguage.m06.ex3;

import java.io.Serial;

// Written by a release whose classes this release cannot read: a cache miss, typically during a rollout.
public final class IncompatibleSessionException extends SessionDecodingException {

    @Serial
    private static final long serialVersionUID = 1L;

    IncompatibleSessionException(Throwable cause) {
        super("session written by an incompatible release: " + cause.getMessage(), cause);
    }
}
