import { useEffect, useState } from 'react';
import { fetchUser, type User } from './userApi';

type Result = { forId: string; user: User } | { forId: string; error: string };

/** The hooks version: one effect per concern instead of one method per moment in time. */
export function UserCard({ userId }: { userId: string }) {
  const [result, setResult] = useState<Result | null>(null);

  // Replaces componentDidMount + componentDidUpdate(prevProps.userId) + componentWillUnmount.
  useEffect(() => {
    const controller = new AbortController();
    fetchUser(userId, controller.signal)
      .then((user) => setResult({ forId: userId, user }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResult({ forId: userId, error: String(error) });
      });
    return () => controller.abort();
  }, [userId]);

  // Replaces the document.title half of componentDidUpdate.
  const name = result && 'user' in result ? result.user.name : null;
  useEffect(() => {
    if (name) document.title = name;
  }, [name]);

  if (result?.forId !== userId) return <p>Loading…</p>;
  if ('error' in result) return <p role="alert">{result.error}</p>;
  return <h2>{result.user.name}</h2>;
}
