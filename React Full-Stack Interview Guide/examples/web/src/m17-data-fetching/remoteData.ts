import type { UseQueryResult } from '@tanstack/react-query';

/**
 * What a list screen can show. One variant at a time, so "loading AND error" is unrepresentable,
 * and "empty" is a first-class state instead of an `items.length === 0` check scattered in JSX.
 */
export type RemoteData<T> =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'empty' }
  | { kind: 'success'; data: T[] };

/**
 * Maps a TanStack Query result (status: pending | error | success) onto the screen's union.
 * @param query - The result of `useQuery` for a list.
 * @returns The single state the UI should render.
 */
export function toRemoteData<T>(query: UseQueryResult<T[]>): RemoteData<T> {
  switch (query.status) {
    case 'pending':
      return { kind: 'loading' };
    case 'error':
      return { kind: 'error', message: query.error.message };
    case 'success':
      return query.data.length === 0 ? { kind: 'empty' } : { kind: 'success', data: query.data };
  }
}
