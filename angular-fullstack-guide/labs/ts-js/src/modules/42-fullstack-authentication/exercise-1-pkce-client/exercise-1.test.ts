// Exercise 42.1: six criteria, each run over both variants (a: pending request in a key-value store keyed by `state`;
// b: one pending request in memory). The IdP is a stub: a token endpoint function that signs an ID token with a key the
// test generates. Randomness is a fixed sequence (call n returns 32 bytes of value n) and `now` is passed in.
import { createClientA } from './a/client';
import { createClientB } from './b/client';
import type { ClientConfig, ClientDeps, KeyValueStore, OidcClient, TokenEndpoint, TokenRequest } from './oidc-client';
import { base64UrlEncode } from '../concepts/jwt';
import { verifyPkce } from '../concepts/pkce';

type Variant = 'a' | 'b';

const ISSUER = 'https://idp.example.com';
const REDIRECT_URI = 'https://app.example.com/callback';
const NOW = 1_700_000_000;
const config: ClientConfig = {
  issuer: ISSUER,
  authorizationEndpoint: `${ISSUER}/authorize`,
  clientId: 'angular-app',
  redirectUri: REDIRECT_URI,
  scope: 'openid profile',
};
const encoder = new TextEncoder();

let signingKeys: CryptoKeyPair;

beforeAll(async () => {
  signingKeys = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
});

/** Call n returns `length` bytes of value n, so verifier, state and nonce are distinct and known. */
function sequenceRandom(): (length: number) => Uint8Array {
  let call = 0;
  return (length) => new Uint8Array(length).fill(++call);
}

const bytesOf = (value: number): string => base64UrlEncode(new Uint8Array(32).fill(value));

function mapStore(): KeyValueStore {
  const entries = new Map<string, string>();
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => void entries.set(key, value),
    removeItem: (key) => void entries.delete(key),
  };
}

/** An ES256 ID token as the IdP would sign it. `roles` is there only because `concepts/jwt.ts` expects it. */
async function signIdToken(nonce: string): Promise<string> {
  const encode = (value: object): string => base64UrlEncode(encoder.encode(JSON.stringify(value)));
  const claims = { iss: ISSUER, aud: config.clientId, sub: 'user-1', exp: NOW + 300, roles: [], nonce };
  const input = `${encode({ alg: 'ES256', typ: 'JWT' })}.${encode(claims)}`;
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, signingKeys.privateKey, encoder.encode(input));
  return `${input}.${base64UrlEncode(new Uint8Array(signature))}`;
}

interface Rig {
  readonly client: OidcClient;
  /** Every request the stubbed token endpoint received. */
  readonly tokenRequests: TokenRequest[];
  /** The nonce the stubbed IdP puts in its ID token; `login` copies the request's nonce here. */
  readonly idp: { nonce: string };
}

function createRig(variant: Variant): Rig {
  const tokenRequests: TokenRequest[] = [];
  const idp = { nonce: '' };
  const tokenEndpoint: TokenEndpoint = async (request) => {
    tokenRequests.push(request);
    return { access_token: 'access-token-1', id_token: await signIdToken(idp.nonce) };
  };
  const deps: ClientDeps = { config, random: sequenceRandom(), tokenEndpoint, idTokenKey: signingKeys.publicKey };
  const client = variant === 'a' ? createClientA({ ...deps, store: mapStore() }) : createClientB(deps);
  return { client, tokenRequests, idp };
}

/** Starts a login and lets the stubbed IdP echo the request's nonce. Returns the authorization URL's parameters. */
async function login(rig: Rig): Promise<URLSearchParams> {
  const params = new URL(await rig.client.begin()).searchParams;
  rig.idp.nonce = params.get('nonce') ?? '';
  return params;
}

function callback(entries: Readonly<Record<string, string>>): string {
  return `${REDIRECT_URI}?${new URLSearchParams(entries).toString()}`;
}

describe.each<Variant>(['a', 'b'])('Exercise 42.1, variant %s', (variant) => {
  it('builds an authorization URL with `response_type=code`, `code_challenge_method=S256`, `state` and `nonce`', async () => {
    const rig = createRig(variant);
    const params = await login(rig);
    expect(params.get('response_type')).toBe('code');
    expect(params.get('code_challenge_method')).toBe('S256');
    expect(params.get('state')).toBe(bytesOf(2));
    expect(params.get('nonce')).toBe(bytesOf(3));
    expect(params.get('client_id')).toBe('angular-app');
    expect(params.get('redirect_uri')).toBe(REDIRECT_URI);
  });

  it('rejects a callback whose `state` does not match a pending request', async () => {
    const rig = createRig(variant);
    await login(rig);
    const result = await rig.client.handleCallback(callback({ code: 'code-1', state: 'forged', iss: ISSUER }), NOW);
    expect(result).toEqual({ ok: false, reason: 'state_mismatch' });
    expect(rig.tokenRequests).toHaveLength(0);
  });

  it('rejects a callback whose `iss` differs from the configured issuer', async () => {
    const rig = createRig(variant);
    const params = await login(rig);
    const state = params.get('state') ?? '';
    const result = await rig.client.handleCallback(callback({ code: 'code-1', state, iss: 'https://evil.example.com' }), NOW);
    expect(result).toEqual({ ok: false, reason: 'issuer_mismatch' });
    expect(rig.tokenRequests).toHaveLength(0);
  });

  it('turns an `error=access_denied` callback into an error result without calling the token endpoint', async () => {
    const rig = createRig(variant);
    const params = await login(rig);
    const state = params.get('state') ?? '';
    const result = await rig.client.handleCallback(callback({ error: 'access_denied', state, iss: ISSUER }), NOW);
    expect(result).toEqual({ ok: false, reason: 'authorization_error', providerError: 'access_denied' });
    expect(rig.tokenRequests).toHaveLength(0);
  });

  it('sends the stored `code_verifier` with the code to the token endpoint', async () => {
    const rig = createRig(variant);
    const params = await login(rig);
    const state = params.get('state') ?? '';
    const result = await rig.client.handleCallback(callback({ code: 'code-1', state, iss: ISSUER }), NOW);
    expect(result.ok).toBe(true);
    expect(rig.tokenRequests).toHaveLength(1);
    const [request] = rig.tokenRequests;
    expect(request?.code).toBe('code-1');
    expect(request?.code_verifier).toBe(bytesOf(1));
    expect(await verifyPkce(request?.code_verifier ?? '', params.get('code_challenge') ?? '')).toBe(true);
  });

  it('rejects an ID token whose `nonce` differs from the one sent', async () => {
    const rig = createRig(variant);
    const params = await login(rig);
    rig.idp.nonce = 'a-nonce-from-another-login';
    const state = params.get('state') ?? '';
    const result = await rig.client.handleCallback(callback({ code: 'code-1', state, iss: ISSUER }), NOW);
    expect(result).toEqual({ ok: false, reason: 'nonce_mismatch' });
    expect(rig.tokenRequests).toHaveLength(1);
  });
});
