package com.interviewprep.springapi.web;

// Dedicated wire type instead of serializing Spring's FieldError: FieldError exposes
// rejectedValue, codes and objectName, which would leak internals and make the client
// contract depend on Spring's class shape. The client only needs field + message to map
// errors onto form inputs.
public record FieldErrorResponse(String field, String message) {
}
