import { queryOptions } from '@tanstack/react-query';
import { fetchProjects, fetchTodos } from './api';

/**
 * Query keys live in one place. Keys are arrays, matched by prefix, so
 * `invalidateQueries({ queryKey: todoKeys.all })` hits every todo query.
 */
export const todoKeys = {
  all: ['todos'] as const,
  list: () => ['todos', 'list'] as const,
};

/**
 * `queryOptions` bundles key + function + options and tags the key with the data type, so
 * `queryClient.getQueryData(todosQuery().queryKey)` is typed `Todo[] | undefined` without a generic.
 */
export function todosQuery() {
  return queryOptions({
    queryKey: todoKeys.list(),
    queryFn: ({ signal }) => fetchTodos(signal),
  });
}

/** Each page is its own cache entry. 30 s of freshness makes "Previous" instant and free. */
export function projectsQuery(page: number) {
  return queryOptions({
    queryKey: ['projects', { page }] as const,
    queryFn: ({ signal }) => fetchProjects(page, signal),
    staleTime: 30_000,
  });
}
