import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { describeError } from './problem';
import type { ProjectsApi } from './projectsApi';

/** Server-paged list. The page lives in the query key, so each page is its own cache entry (see 17.7). */
export function ProjectsPage({ api, size = 5 }: { api: ProjectsApi; size?: number }) {
  const [page, setPage] = useState(0);
  const query = useQuery({
    queryKey: ['projects', { page, size }],
    queryFn: ({ signal }) => api.list(page, size, signal),
    placeholderData: keepPreviousData,
  });

  if (query.isPending) return <p role="status">Loading projects…</p>;
  if (query.isError) return <p role="alert">{describeError(query.error)}</p>;

  const { content, page: meta } = query.data;
  return (
    <section>
      <ul>
        {content.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
      <p>
        Page {meta.number + 1} of {meta.totalPages} ({meta.totalElements} projects)
      </p>
      <button onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
        Previous
      </button>
      <button onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= meta.totalPages || query.isPlaceholderData}>
        Next
      </button>
    </section>
  );
}
