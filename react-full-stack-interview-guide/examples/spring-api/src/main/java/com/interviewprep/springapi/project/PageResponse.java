package com.interviewprep.springapi.project;

import java.util.List;

// Mirrors Spring Data's PagedModel JSON shape (content + page metadata) so clients written
// against a Spring Data backend work unchanged, without pulling Spring Data in for an
// in-memory store.
public record PageResponse<T>(List<T> content, PageMetadata page) {

    public record PageMetadata(int size, int number, long totalElements, int totalPages) {
    }

    public static <T> PageResponse<T> of(List<T> content, int number, int size, long totalElements) {
        int totalPages = Math.toIntExact(Math.ceilDiv(totalElements, (long) size));
        return new PageResponse<>(content, new PageMetadata(size, number, totalElements, totalPages));
    }
}
