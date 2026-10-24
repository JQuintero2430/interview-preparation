// Exercise 42.1: the client half of an Authorization Code + PKCE login, shared by both variants. Our model, not a library's.
// It mirrors RFC 7636 §4.5 (the token request carries `code_verifier`), RFC 9207 §2.4 (compare `iss` with the issuer the
// request went to), RFC 9700 §4.7.1 (`state` ties the callback to the request) and OpenID Connect Core 1.0 §3.1.3.7 (the
// ID token's `nonce` must equal the one sent). The variants differ only in where the pending request lives between the
// redirect out and the redirect back. Randomness is injected, the token endpoint is a function, and `now` is an argument.
import { base64UrlDecode, verifyJwt } from '../concepts/jwt';
import { startAuthorization } from '../concepts/pkce';
import type { AuthorizationConfig, PendingAuthorization, RandomBytes } from '../concepts/pkce';

export interface ClientConfig extends AuthorizationConfig {
  /** The issuer the authorization request goes to; the callback's `iss` must equal it. */
  readonly issuer: string;
}

/** What the page keeps across the redirect: `state`, `nonce` and the PKCE verifier. */
export type PendingRequest = PendingAuthorization;

/** The part of `sessionStorage` that variant a needs, so a test can pass a Map-backed stand-in. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Where a pending request waits for the callback. `take` removes it, so a callback can be used once. */
export interface PendingStore {
  save(request: PendingRequest): void;
  take(state: string): PendingRequest | undefined;
}

export interface TokenRequest {
  readonly grant_type: 'authorization_code';
  readonly code: string;
  readonly redirect_uri: string;
  readonly client_id: string;
  readonly code_verifier: string;
}

export interface TokenResponse {
  readonly access_token: string;
  readonly id_token: string;
}

/** The token endpoint as a function: the tests stub it, a real app would `fetch`. */
export type TokenEndpoint = (request: TokenRequest) => Promise<TokenResponse>;

export interface ClientDeps {
  readonly config: ClientConfig;
  readonly random: RandomBytes;
  readonly tokenEndpoint: TokenEndpoint;
  /** The key that verifies the ID token's signature (ES256, as `concepts/jwt.ts` does). */
  readonly idTokenKey: CryptoKey;
}

export type FailureReason =
  | 'state_mismatch'
  | 'issuer_mismatch'
  | 'authorization_error'
  | 'invalid_id_token'
  | 'nonce_mismatch';

export type CallbackResult =
  | { readonly ok: true; readonly accessToken: string; readonly idToken: string }
  | { readonly ok: false; readonly reason: FailureReason; readonly providerError?: string };

export interface OidcClient {
  /** Returns the authorization URL to redirect to, after storing the pending request. */
  begin(): Promise<string>;
  /** Checks the callback URL, exchanges the code and checks the ID token. `now` is epoch seconds. */
  handleCallback(callbackUrl: string, now: number): Promise<CallbackResult>;
}

const failure = (reason: FailureReason): CallbackResult => ({ ok: false, reason });
const textDecoder = new TextDecoder();

/** Reads `nonce` from an ID token whose signature was already verified. */
function nonceOf(idToken: string): string | undefined {
  const [, payload = ''] = idToken.split('.');
  const claims: unknown = JSON.parse(textDecoder.decode(base64UrlDecode(payload)));
  if (typeof claims !== 'object' || claims === null || !('nonce' in claims)) return undefined;
  return typeof claims.nonce === 'string' ? claims.nonce : undefined;
}

export function createOidcClient(deps: ClientDeps, store: PendingStore): OidcClient {
  const { config, random, tokenEndpoint, idTokenKey } = deps;

  async function begin(): Promise<string> {
    const { url, pending } = await startAuthorization(config, random);
    store.save(pending);
    return url;
  }

  async function exchange(code: string, pending: PendingRequest, now: number): Promise<CallbackResult> {
    const tokens = await tokenEndpoint({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
      code_verifier: pending.verifier,
    });
    if (!(await verifyJwt(tokens.id_token, idTokenKey, now)).valid) return failure('invalid_id_token');
    if (nonceOf(tokens.id_token) !== pending.nonce) return failure('nonce_mismatch');
    return { ok: true, accessToken: tokens.access_token, idToken: tokens.id_token };
  }

  async function handleCallback(callbackUrl: string, now: number): Promise<CallbackResult> {
    const params = new URL(callbackUrl).searchParams;
    const state = params.get('state');
    const pending = state === null ? undefined : store.take(state);
    if (pending === undefined) return failure('state_mismatch');
    if (params.get('iss') !== config.issuer) return failure('issuer_mismatch');
    const code = params.get('code');
    const providerError = params.get('error');
    if (providerError !== null || code === null) {
      return { ok: false, reason: 'authorization_error', providerError: providerError ?? 'invalid_response' };
    }
    return exchange(code, pending, now);
  }

  return { begin, handleCallback };
}
