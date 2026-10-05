package com.interviewprep.springapi.project;

import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponseException;

// Extending ErrorResponseException rather than adding an @ExceptionHandler lets the inherited
// ResponseEntityExceptionHandler render it as problem+json with no new advice code. The type is
// set here, not left to the advice's about:blank fallback, because a specific type URI is the
// intended contract for clients to tell "not found" apart from generic failures. example.com is
// the RFC 2606 reserved placeholder for a domain the project owns: an absolute URI on it cannot
// point at a third party's site, and unlike a relative reference it does not resolve differently
// behind the dev proxy, on port 8080 or under MockMvc.
public class ProjectNotFoundException extends ErrorResponseException {

    private static final URI TYPE = URI.create("https://example.com/problems/project-not-found");
    private static final String TITLE = "Project not found";
    private static final String DETAIL_FORMAT = "Project %d does not exist";

    public ProjectNotFoundException(long id) {
        super(HttpStatus.NOT_FOUND, problemFor(id), null);
    }

    private static ProblemDetail problemFor(long id) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, DETAIL_FORMAT.formatted(id));
        problem.setType(TYPE);
        problem.setTitle(TITLE);
        return problem;
    }
}
