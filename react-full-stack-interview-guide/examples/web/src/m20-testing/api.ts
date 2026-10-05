export const API_BASE = 'https://api.example.test';

export type User = { id: string; name: string; email: string };

/**
 * GET /users/:id.
 * @throws Error('HTTP <status>') for a non-2xx answer, so the UI can show the status.
 */
export async function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // Unchecked cast: validate with a schema (Zod) when the payload is not trusted.
  return (await res.json()) as User;
}
