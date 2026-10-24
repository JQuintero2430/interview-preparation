// Section 2 model: PKCE and the Authorization Code request a single-page app builds. Our model, not Spring's code.
// It mirrors RFC 7636 §4.1-§4.3 and §4.6 (verifier, S256 challenge, the token endpoint's comparison), RFC 9700 §4.7.1
// (a random `state` ties the callback to the request) and OpenID Connect Core 1.0 §3.1.2.1 (`openid` scope, `nonce`).
// Spring Security 7.1.1 builds the same parameters in DefaultOAuth2AuthorizationRequestResolver (facts F4b, F5, F7, F8).
// Randomness is an argument and nothing here reads the clock or the network.
import { base64UrlEncode } from './jwt';

/** Source of random bytes, injected so that a test can supply a known sequence. */
export type RandomBytes = (length: number) => Uint8Array;

export interface PkcePair {
  readonly verifier: string;
  readonly challenge: string;
}

export interface AuthorizationConfig {
  readonly authorizationEndpoint: string;
  readonly clientId: string;
  readonly redirectUri: string;
  readonly scope: string;
}

/** What the page keeps across the redirect, and sends to the token endpoint only as `code_verifier`. */
export interface PendingAuthorization {
  readonly state: string;
  readonly nonce: string;
  readonly verifier: string;
}

/** RFC 7636 §4.1 NOTE: 32 random octets, base64url-encoded, make a 43-character verifier. */
const RANDOM_OCTETS = 32;
const textEncoder = new TextEncoder();

/** RFC 7636 §4.2: BASE64URL-ENCODE(SHA256(ASCII(code_verifier))). */
export async function challengeFor(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(verifier));
  return base64UrlEncode(new Uint8Array(digest));
}

export async function createPkcePair(random: RandomBytes): Promise<PkcePair> {
  const verifier = base64UrlEncode(random(RANDOM_OCTETS));
  return { verifier, challenge: await challengeFor(verifier) };
}

/** The token endpoint's check (RFC 7636 §4.6): hash the received verifier and compare it with the stored challenge. */
export async function verifyPkce(verifier: string, challenge: string): Promise<boolean> {
  return (await challengeFor(verifier)) === challenge;
}

/** Builds the redirect to the authorization endpoint and the record the page keeps for the callback. */
export async function startAuthorization(
  config: AuthorizationConfig,
  random: RandomBytes,
): Promise<{ readonly url: string; readonly pending: PendingAuthorization }> {
  const { verifier, challenge } = await createPkcePair(random);
  const pending = {
    state: base64UrlEncode(random(RANDOM_OCTETS)),
    nonce: base64UrlEncode(random(RANDOM_OCTETS)),
    verifier,
  };
  const url = new URL(config.authorizationEndpoint);
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    state: pending.state,
    nonce: pending.nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  }).toString();
  return { url: url.toString(), pending };
}

/** True only when the callback carries the `state` this page sent; a missing or different value is refused. */
export function stateMatches(callbackUrl: string, pending: PendingAuthorization): boolean {
  return new URL(callbackUrl).searchParams.get('state') === pending.state;
}
