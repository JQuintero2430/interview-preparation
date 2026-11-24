package dev.interview.javalanguage.m06.s03;

// The exporter's own failure type: callers depend on it, not on the transport's IOException.
public class ExportFailedException extends RuntimeException {

    public ExportFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}
