// A fake user API: the "server" both UserCard versions load from.
// Every request and abort is recorded so tests can assert on the exact sequence.
export type User = { id: string; name: string };

export const requestLog: string[] = [];

const USERS: Record<string, User> = {
  '1': { id: '1', name: 'Ada Lovelace' },
  '2': { id: '2', name: 'Grace Hopper' },
};

// User 1 answers slowly and user 2 quickly, so a stale response for 1 would land last.
const DELAY_MS: Record<string, number> = { '1': 60, '2': 10 };

/** Resolves with the user after a per-id delay; rejects with an AbortError when the signal aborts. */
export function fetchUser(id: string, signal: AbortSignal): Promise<User> {
  requestLog.push(`request:${id}`);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const user = USERS[id];
      if (user) resolve(user);
      else reject(new Error(`User ${id} not found`));
    }, DELAY_MS[id] ?? 10);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      requestLog.push(`abort:${id}`);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}
