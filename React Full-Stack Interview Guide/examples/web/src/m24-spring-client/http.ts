import { readApiError } from './problem';

/** What the client needs from whoever owns the session. */
export type AuthHooks = {
  getAccessToken: () => string | null;
  /** Obtain a new access token (the refresh cookie is httpOnly, so JS never sees it). Throws on failure. */
  refresh: () => Promise<string>;
  /** Called when the session is over: clear state, route to login. */
  onSignedOut: () => void;
};

export type ApiClient = {
  /** Authenticated fetch: adds the bearer token, refreshes once on 401, throws ApiError on non-2xx. */
  fetch: (path: string, init?: RequestInit) => Promise<Response>;
  /** Same, then parses the JSON body. */
  request: <T>(path: string, init?: RequestInit) => Promise<T>;
};

export type ApiClientOptions = {
  baseUrl: string;
  auth: AuthHooks;
  /** false reproduces the thundering herd: every 401 starts its own refresh. Exists to be compared against. */
  singleFlight?: boolean;
};

export function createApiClient({ baseUrl, auth, singleFlight = true }: ApiClientOptions): ApiClient {
  let inflight: Promise<string> | null = null;

  function refresh(): Promise<string> {
    if (!singleFlight) return auth.refresh();
    inflight ??= auth.refresh().finally(() => {
      inflight = null;
    });
    return inflight;
  }

  function send(path: string, init: RequestInit, token: string | null): Promise<Response> {
    const headers = new Headers(init.headers);
    if (typeof init.body === 'string' && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return globalThis.fetch(`${baseUrl}${path}`, { ...init, headers, credentials: 'include' });
  }

  async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
    const usedToken = auth.getAccessToken();
    let res = await send(path, init, usedToken);

    if (res.status === 401) {
      const current = auth.getAccessToken();
      let token: string;
      try {
        // Someone already refreshed while this request was in flight: just retry with their token.
        token = current !== usedToken && current !== null ? current : await refresh();
      } catch {
        auth.onSignedOut();
        throw await readApiError(res);
      }
      res = await send(path, init, token); // retried exactly once: no loop
      if (res.status === 401) auth.onSignedOut();
    }

    if (!res.ok) throw await readApiError(res);
    return res;
  }

  return {
    fetch: authedFetch,
    request: async <T>(path: string, init?: RequestInit) => {
      const text = await (await authedFetch(path, init)).text();
      return (text ? JSON.parse(text) : undefined) as T; // 204/empty bodies are legal
    },
  };
}
