import { useState, type ChangeEvent } from 'react';
import type { SearchUsersNoSignal, User } from './types';

// DELIBERATELY FLAWED (interview exercise 1). It type-checks and passes lint; every flaw is behavioural.
// Find them before reading UserSearchFixed.tsx. The checklist is in 27.3 of the guide.
export function UserSearchFlawed({
  search,
  onSelect,
}: {
  search: SearchUsersNoSignal;
  onSelect: (user: User) => void;
}) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setQuery(next);
    setLoading(true);
    search(next).then((found) => {
      setUsers(found);
      setCount(found.length);
      setLoading(false);
    });
  }

  return (
    <div>
      <input placeholder="Search users" value={query} onChange={handleChange} />
      {loading && <p>Searching…</p>}
      <p>{count} results</p>
      {users.map((user, index) => (
        <div key={index} onClick={() => onSelect(user)}>
          {user.name}
        </div>
      ))}
    </div>
  );
}
