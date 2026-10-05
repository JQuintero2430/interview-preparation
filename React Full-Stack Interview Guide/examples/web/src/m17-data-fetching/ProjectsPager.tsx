import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { projectsQuery } from './queries';

const FIRST_PAGE = 1;

/**
 * Offset pagination with TanStack Query. Every page is its own cache entry; while the next page
 * loads, `placeholderData: keepPreviousData` keeps showing the previous page instead of
 * dropping back to a loading screen.
 */
export function ProjectsPager() {
  const [page, setPage] = useState(FIRST_PAGE);
  const query = useQuery({ ...projectsQuery(page), placeholderData: keepPreviousData });

  if (query.status === 'pending') return <p role="status">Loading projects…</p>;
  if (query.status === 'error') return <p role="alert">Could not load projects: {query.error.message}</p>;

  // While isPlaceholderData is true, `data` is the PREVIOUS page, so its hasMore is not ours.
  const canGoNext = !query.isPlaceholderData && query.data.hasMore;

  return (
    <section aria-busy={query.isFetching}>
      <ul className={query.isPlaceholderData ? 'is-stale' : undefined}>
        {query.data.items.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
      <p>Page {page}</p>
      {query.isPlaceholderData && <p role="status">Loading page {page}…</p>}
      <button onClick={() => setPage((p) => p - 1)} disabled={page === FIRST_PAGE}>
        Previous
      </button>
      <button onClick={() => setPage((p) => p + 1)} disabled={!canGoNext}>
        Next
      </button>
    </section>
  );
}
