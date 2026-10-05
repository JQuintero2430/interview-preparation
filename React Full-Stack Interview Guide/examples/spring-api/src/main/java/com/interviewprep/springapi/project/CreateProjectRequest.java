package com.interviewprep.springapi.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// @NotBlank rather than @NotEmpty: a whitespace-only name renders as an empty row in the
// client list, so it is rejected as missing. @NotBlank also fails on null, which keeps an
// absent "name" on the Bean Validation path (field error) instead of a JSON-parsing 400.
public record CreateProjectRequest(@NotBlank @Size(max = CreateProjectRequest.MAX_NAME_LENGTH) String name) {

    // Package-private, not private: the constant is referenced from the record header, which is
    // outside the record body for access purposes.
    static final int MAX_NAME_LENGTH = 60;
}
