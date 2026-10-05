import { useUser } from './useUser';

/** Loading, error (with retry) and success states for one user. */
export function UserProfile({ userId }: { userId: string }) {
  const query = useUser(userId);

  if (query.isPending) return <p role="status">Loading user…</p>;

  if (query.isError) {
    return (
      <div role="alert">
        <p>Could not load user: {query.error.message}</p>
        <button type="button" disabled={query.isFetching} onClick={() => void query.refetch()}>
          {query.isFetching ? 'Retrying…' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <article aria-label="User profile">
      <h2>{query.data.name}</h2>
      <p>{query.data.email}</p>
    </article>
  );
}
