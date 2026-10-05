import { useEffect, useId, useState } from 'react';
import type { SearchUsers, User } from './types';

type Outcome = { for: string; users: User[] } | { for: string; error: string };

// The reviewed version of UserSearchFlawed. Each change maps to an item in the 27.3 checklist.
export function UserSearchFixed({
  search,
  onSelect,
}: {
  search: SearchUsers;
  onSelect: (user: User) => void;
}) {
  const inputId = useId();
  const [query, setQuery] = useState('');
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const term = query.trim();

  useEffect(() => {
    if (term === '') return undefined; // nothing to synchronize with
    const controller = new AbortController();
    search(term, controller.signal).then(
      (users) => {
        if (!controller.signal.aborted) setOutcome({ for: term, users });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setOutcome({ for: term, error: error instanceof Error ? error.message : 'Search failed' });
      },
    );
    return () => controller.abort();
  }, [term, search]);

  // Derived during render: only an answer that belongs to the CURRENT term is shown.
  const current = term !== '' && outcome?.for === term ? outcome : null;
  const loading = term !== '' && current === null;

  let status = '';
  if (loading) status = 'Searching…';
  else if (current && 'users' in current) {
    const n = current.users.length;
    status = n === 0 ? `No users match "${term}"` : `${n} ${n === 1 ? 'result' : 'results'}`;
  }

  return (
    <div>
      <label htmlFor={inputId}>Search users</label>
      <input id={inputId} type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
      <p role="status">{status}</p>
      {current && 'error' in current && <p role="alert">Could not load users: {current.error}</p>}
      {current && 'users' in current && (
        <ul>
          {current.users.map((user) => (
            <li key={user.id}>
              <button type="button" onClick={() => onSelect(user)}>
                {user.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
