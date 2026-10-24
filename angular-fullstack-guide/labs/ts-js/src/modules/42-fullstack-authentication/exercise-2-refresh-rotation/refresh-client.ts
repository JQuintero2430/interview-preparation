// Exercise 42.2: the client side, shared by both variants. Our model, not a library's. A caller asks for an access
// token; the client returns the stored one while it is valid, otherwise spends the stored refresh token once, stores
// the rotated pair (RFC 6749 §6: the client "MUST discard the old refresh token"), and treats `invalid_grant` as
// signed out. The variants differ only in how concurrent callers share one refresh. `now` (epoch seconds) is an argument.
import type { TokenError, TokenResponse } from './token-endpoint';

/** Tokens as the client keeps them: the response's `expires_in` turned into an absolute time. */
export interface StoredTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: number;
}

/** Where the tokens live. Two tabs share one store only if it is shared storage (`localStorage`, not `sessionStorage`). */
export interface TokenStore {
  read(): StoredTokens | undefined;
  write(tokens: StoredTokens | undefined): void;
}

/** The refresh token grant as the client sees it: a request over the network. */
export type RefreshGrant = (refreshToken: string, now: number) => Promise<TokenResponse | TokenError>;

export interface ClientDeps {
  readonly store: TokenStore;
  readonly refresh: RefreshGrant;
}

export interface RefreshClient {
  /** A valid access token, or `undefined` once signed out (the app then starts a new login). */
  accessToken(now: number): Promise<string | undefined>;
}

export function storedTokens(response: TokenResponse, now: number): StoredTokens {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresAt: now + response.expires_in,
  };
}

/** The stored access token if it is still valid at `now`. */
export function validAccessToken(store: TokenStore, now: number): string | undefined {
  const tokens = store.read();
  return tokens !== undefined && now < tokens.expiresAt ? tokens.accessToken : undefined;
}

/** Spends the stored refresh token once. `invalid_grant` is final: retrying would only replay a dead token. */
export async function refreshStored({ store, refresh }: ClientDeps, now: number): Promise<string | undefined> {
  const tokens = store.read();
  if (tokens === undefined) return undefined;
  const response = await refresh(tokens.refreshToken, now);
  if ('error' in response) {
    store.write(undefined);
    return undefined;
  }
  store.write(storedTokens(response, now));
  return response.access_token;
}
