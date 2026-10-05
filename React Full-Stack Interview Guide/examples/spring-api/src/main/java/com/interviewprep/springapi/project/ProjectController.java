package com.interviewprep.springapi.project;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

// No class-level @Validated: Spring MVC's built-in method validation raises
// HandlerMethodValidationException, which ResponseEntityExceptionHandler already maps to a
// 400 ProblemDetail; the AOP-based alternative would raise ConstraintViolationException and
// need a hand-written mapping.
@RestController
@RequestMapping(ProjectController.PATH)
public class ProjectController {

    static final String PATH = "/api/projects";
    private static final String ID_PATH = "/{id}";
    private static final String DEFAULT_PAGE = "0";
    private static final String DEFAULT_SIZE = "10";
    private static final long MIN_PAGE = 0;
    private static final long MIN_SIZE = 1;
    // Upper bound caps the work a single request can force on the server.
    private static final long MAX_SIZE = 50;

    private final InMemoryProjectRepository repository;

    public ProjectController(InMemoryProjectRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public PageResponse<Project> list(
            @RequestParam(defaultValue = DEFAULT_PAGE) @Min(MIN_PAGE) int page,
            @RequestParam(defaultValue = DEFAULT_SIZE) @Min(MIN_SIZE) @Max(MAX_SIZE) int size) {
        return repository.findPage(page, size);
    }

    @GetMapping(ID_PATH)
    public Project get(@PathVariable long id) {
        return repository.findById(id).orElseThrow(() -> new ProjectNotFoundException(id));
    }

    // Location is built from the current request URI rather than a hard-coded host so it stays
    // correct behind any context path or forwarded host; @Valid on the body (and no constraint on
    // the parameter itself) keeps failures on MethodArgumentNotValidException, whose field errors
    // ApiExceptionHandler exposes for client-side form mapping.
    @PostMapping
    public ResponseEntity<Project> create(@Valid @RequestBody CreateProjectRequest request) {
        Project saved = repository.save(request.name());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path(ID_PATH)
                .buildAndExpand(saved.id())
                .toUri();
        return ResponseEntity.created(location).body(saved);
    }
}
