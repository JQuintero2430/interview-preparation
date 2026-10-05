// The wire contract of examples/spring-api, written down once as TypeScript types.
// Every shape below is what the Java records serialize to (verified against the MockMvc tests there).

/** Base URL of the Spring API (`mvn spring-boot:run` listens on 8080). Tests answer it with MSW. */
export const API_ORIGIN = 'http://localhost:8080';

export type Project = { id: number; name: string };

/** Mirrors Spring Data's PagedModel JSON: `content` plus a `page` metadata object. 0-based `number`. */
export type PageMetadata = { size: number; number: number; totalElements: number; totalPages: number };
export type PageResponse<T> = { content: T[]; page: PageMetadata };

export type CreatedProject = { project: Project; location: string | null };
