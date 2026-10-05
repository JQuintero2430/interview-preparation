import type { AuthHooks } from './http';
import { ApiError } from './problem';

export type Session = AuthHooks & { setAccessToken: (token: string | null) => void };

/**
 * An in-memory access token plus a refresh call. The refresh token lives in an httpOnly cookie,
 * so this code can POST /auth/refresh with `credentials: 'include'` but can never read it.
 * `/auth/refresh` is NOT part of examples/spring-api: it is the contract an auth server would expose.
 */
export function createSession(baseUrl: string, onSignedOut: () => void = () => {}): Session {
  let token: string | null = null;
  return {
    getAccessToken: () => token,
    setAccessToken: (next) => {
      token = next;
    },
    async refresh() {
      const res = await fetch(`${baseUrl}/auth/refresh`, { method: 'POST', credentials: 'include' });
      if (!res.ok) {
        token = null;
        throw new ApiError(res.status);
      }
      const body = (await res.json()) as { accessToken: string };
      token = body.accessToken;
      return token;
    },
    onSignedOut: () => {
      token = null;
      onSignedOut();
    },
  };
}
