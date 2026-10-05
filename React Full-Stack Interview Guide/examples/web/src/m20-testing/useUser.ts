import { useQuery } from '@tanstack/react-query';
import { fetchUser } from './api';

/** One user, cached under ['user', id]. TanStack Query passes an AbortSignal it fires on cancel. */
export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: ({ signal }) => fetchUser(id, signal),
  });
}
