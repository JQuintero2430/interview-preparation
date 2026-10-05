package com.interviewprep.springapi.web;

import java.net.URI;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

// Extending ResponseEntityExceptionHandler rather than enabling spring.mvc.problemdetails
// keeps the errors extension and the type fallback in one advice, while the inherited handlers
// render validation and type-mismatch failures, and ErrorResponseException subclasses such as
// ProjectNotFoundException, as RFC 9457 ProblemDetail with no extra handler code (the instance
// URI is filled from the request path by the MVC return-value handler).
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    // RFC 9457 section 4.2.1: about:blank means "no semantics beyond the HTTP status", which is
    // exactly what these generic 400s carry; a per-error-kind URI was rejected because no client
    // distinguishes them yet and inventing unresolvable URIs would freeze an undocumented contract.
    private static final URI DEFAULT_PROBLEM_TYPE = URI.create("about:blank");

    // RFC 9457 extension member; the intended client contract is that a form maps each entry
    // onto its input field by name.
    private static final String ERRORS_PROPERTY = "errors";

    // Field then message gives a stable order across requests, so clients and tests do not
    // depend on the validator's unspecified constraint evaluation order.
    private static final Comparator<FieldErrorResponse> FIELD_ERROR_ORDER = Comparator
            .comparing(FieldErrorResponse::field)
            .thenComparing(FieldErrorResponse::message);

    // Starts from the exception's own ProblemDetail so type/title/status/detail stay the ones
    // Spring defines; the body is passed explicitly (not null) so the extension does not depend
    // on updateAndGetBody returning the same instance, and it still flows through createResponseEntity
    // for the about:blank type fallback. Only field errors are exposed: global (object-level)
    // errors have no input to attach to, and CreateProjectRequest declares none.
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        ProblemDetail problem = ex.getBody();
        List<FieldErrorResponse> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new FieldErrorResponse(error.getField(), error.getDefaultMessage()))
                .sorted(FIELD_ERROR_ORDER)
                .toList();
        problem.setProperty(ERRORS_PROPERTY, errors);
        return handleExceptionInternal(ex, problem, headers, status, request);
    }

    // RFC 9457 section 3.1.1 already reads an absent "type" as about:blank, but Spring Framework 7
    // no longer defaults ProblemDetail.type and its Jackson mixin omits null fields, while this
    // API's contract, which clients and tests rely on, is that "type" is always present explicitly.
    // Filling it here, after the inherited handler has built the body, covers every inherited and
    // future handler in one place instead of each handler setting it individually.
    @Override
    protected ResponseEntity<Object> createResponseEntity(
            Object body, HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {
        if (body instanceof ProblemDetail problem && problem.getType() == null) {
            problem.setType(DEFAULT_PROBLEM_TYPE);
        }
        return super.createResponseEntity(body, headers, statusCode, request);
    }
}
