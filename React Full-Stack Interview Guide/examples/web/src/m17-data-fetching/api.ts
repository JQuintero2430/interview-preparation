// The fake backend every m17 example talks to. Tests answer these URLs with MSW.
export const API = 'https://api.example.test';

export type Todo = { id: string; title: string; done: boolean };
export type Project = { id: number; name: string };
export type ProjectPage = { items: Project[]; page: number; hasMore: boolean };
export type Post = { id: number; title: string };
export type FeedPage = { posts: Post[]; nextCursor: number | null };

/** `fetch` only rejects on network failure, so a 4xx/5xx is turned into a thrown error here. */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

/**
 * GETs (or sends) JSON and throws on a non-2xx status, which is what TanStack Query needs:
 * a query function must throw (or reject) for the query to enter the `error` state.
 * @param url - Absolute URL to request.
 * @param init - Optional fetch options, usually just the `signal` TanStack Query passes in.
 * @returns The parsed body. Unchecked cast: validate with Zod when the payload is not trusted.
 */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new HttpError(res.status);
  return (await res.json()) as T;
}

export function fetchTodos(signal?: AbortSignal): Promise<Todo[]> {
  return fetchJson<Todo[]>(`${API}/todos`, { signal });
}

export function createTodo(title: string): Promise<Todo> {
  return fetchJson<Todo>(`${API}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
}

export function fetchProjects(page: number, signal?: AbortSignal): Promise<ProjectPage> {
  return fetchJson<ProjectPage>(`${API}/projects?page=${page}`, { signal });
}

export function fetchFeed(cursor: number, signal?: AbortSignal): Promise<FeedPage> {
  return fetchJson<FeedPage>(`${API}/feed?cursor=${cursor}`, { signal });
}
