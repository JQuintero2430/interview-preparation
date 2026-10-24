// Section 5 claims, about our models (jwt-validator.ts, authorities.ts) of a Spring Boot 4.1.1 resource server with
// only `issuer-uri`: 60 seconds of clock skew, `aud` unchecked until `audiences` is set, an unsigned or HS256 token
// refused when only RS256 is allowed, `scope` mapped to `SCOPE_` authorities, and a custom claim and prefix for roles.
// RSA keys are generated here with WebCrypto (none is committed); `now` is a constant (no clock, no network).
import { base64UrlEncode } from './jwt';
import { authoritiesFrom, type AuthorityMapping } from './authorities';
import {
  signJws,
  signingInputOf,
  springDefaults,
  validate,
  type Claims,
  type JoseHeader,
  type KeySet,
  type ResourceServerPolicy,
  type TokenValidation,
} from './jwt-validator';

/** 2026-01-01T00:00:00Z in epoch seconds. */
const NOW = 1_767_225_600;
const ISSUER = 'https://idp.example.com';
const KID = 'idp-key-1';
const policy = springDefaults(ISSUER);
const textEncoder = new TextEncoder();

async function rsaKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify'],
  );
}

let issuerKeys: CryptoKeyPair;
let jwks: KeySet;

beforeAll(async () => {
  issuerKeys = await rsaKeyPair();
  jwks = new Map([[KID, issuerKeys.publicKey]]);
});

function claimsWith(extra: Claims = {}): Claims {
  return { iss: ISSUER, sub: 'ana', exp: NOW + 300, scope: 'orders:read', ...extra };
}

async function issue(extra: Claims = {}): Promise<string> {
  const header: JoseHeader = { alg: 'RS256', typ: 'JWT', kid: KID };
  return signJws(header, claimsWith(extra), issuerKeys.privateKey);
}

async function check(token: string, checkedBy: ResourceServerPolicy = policy): Promise<TokenValidation> {
  return validate(token, jwks, checkedBy, NOW);
}

describe('Module 42 · section 5', () => {
  it('Section 5: a token expired 30 seconds ago passes with 60 seconds of skew and fails at 61', async () => {
    expect(policy.clockSkewSeconds).toBe(60);
    expect(await check(await issue({ exp: NOW - 30 }))).toMatchObject({ valid: true });
    // JwtTimestampValidator refuses only when now minus the skew is after exp, so exactly 60 s still passes.
    expect(await check(await issue({ exp: NOW - 60 }))).toMatchObject({ valid: true });
    expect(await check(await issue({ exp: NOW - 61 }))).toEqual({ valid: false, reason: 'expired' });
    // The same window applies before nbf.
    expect(await check(await issue({ nbf: NOW + 60 }))).toMatchObject({ valid: true });
    expect(await check(await issue({ nbf: NOW + 61 }))).toEqual({ valid: false, reason: 'not-yet-valid' });
    // Without skew, the token expired 30 seconds ago is refused.
    expect(await check(await issue({ exp: NOW - 30 }), { ...policy, clockSkewSeconds: 0 })).toEqual({
      valid: false,
      reason: 'expired',
    });
  });

  it('Section 5: a token for another audience passes until audiences is configured', async () => {
    const forBilling = await issue({ aud: 'billing-api' });
    expect(policy.audiences).toEqual([]);
    expect(await check(forBilling)).toMatchObject({ valid: true });

    const ordersApi: ResourceServerPolicy = { ...policy, audiences: ['orders-api'] };
    expect(await check(forBilling, ordersApi)).toEqual({ valid: false, reason: 'audience' });
    expect(await check(await issue({ aud: ['billing-api', 'orders-api'] }), ordersApi)).toMatchObject({ valid: true });
    // Once audiences is set, a token without aud is refused too.
    expect(await check(await issue(), ordersApi)).toEqual({ valid: false, reason: 'audience' });
  });

  it('Section 5: alg none and HS256 are refused when only RS256 is allowed', async () => {
    expect(policy.algorithms).toEqual(['RS256']);
    expect(await check(await issue())).toMatchObject({ valid: true });

    const unsigned = `${signingInputOf({ alg: 'none', typ: 'JWT' }, claimsWith())}.`;
    expect(await check(unsigned)).toEqual({ valid: false, reason: 'algorithm' });

    // Algorithm confusion: an HMAC keyed with the issuer's public key, which anyone can download from the JWKS.
    const publicKeyBytes = await crypto.subtle.exportKey('spki', issuerKeys.publicKey);
    const hmacKey = await crypto.subtle.importKey('raw', publicKeyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, [
      'sign',
    ]);
    const hsInput = signingInputOf({ alg: 'HS256', typ: 'JWT', kid: KID }, claimsWith());
    const hsSignature = await crypto.subtle.sign('HMAC', hmacKey, textEncoder.encode(hsInput));
    const confused = `${hsInput}.${base64UrlEncode(new Uint8Array(hsSignature))}`;
    expect(await check(confused)).toEqual({ valid: false, reason: 'algorithm' });
    // Even with HS256 allowed, our model never checks an HMAC with an RSA key (one algorithm per key).
    expect(await check(confused, { ...policy, algorithms: ['RS256', 'HS256'] })).toEqual({
      valid: false,
      reason: 'signature',
    });

    // RS256 itself is not enough: a key the JWKS does not hold fails the signature.
    const stranger = await rsaKeyPair();
    const forged = await signJws({ alg: 'RS256', typ: 'JWT', kid: KID }, claimsWith(), stranger.privateKey);
    expect(await check(forged)).toEqual({ valid: false, reason: 'signature' });
  });

  it('Section 5: scope "orders:read orders:write" becomes SCOPE_orders:read and SCOPE_orders:write', async () => {
    const expected = ['SCOPE_orders:read', 'SCOPE_orders:write'];
    expect(authoritiesFrom({ scope: 'orders:read orders:write' })).toEqual(expected);
    expect(authoritiesFrom({ scp: ['orders:read', 'orders:write'] })).toEqual(expected);
    // `scope` is read first; `scp` only when there is no `scope`.
    expect(authoritiesFrom({ scope: 'orders:read', scp: ['admin'] })).toEqual(['SCOPE_orders:read']);
    expect(authoritiesFrom({ sub: 'ana' })).toEqual([]);

    // Only a validated token's claims are mapped.
    const result = await check(await issue({ scope: 'orders:read orders:write' }));
    if (!result.valid) throw new Error(`token refused: ${result.reason}`);
    expect(authoritiesFrom(result.claims)).toEqual(expected);
  });

  it('Section 5: a roles claim maps to ROLE_ authorities with a custom claim name and prefix', () => {
    const claims: Claims = { scope: 'orders:read', roles: ['admin', 'support'] };
    // The default mapping ignores `roles`.
    expect(authoritiesFrom(claims)).toEqual(['SCOPE_orders:read']);

    const roles: AuthorityMapping = { claimNames: ['roles'], prefix: 'ROLE_', delimiter: ' ' };
    expect(authoritiesFrom(claims, roles)).toEqual(['ROLE_admin', 'ROLE_support']);
    // hasRole('ADMIN') looks for ROLE_ADMIN; the claim's case is kept, so it does not match.
    expect(authoritiesFrom(claims, roles)).not.toContain('ROLE_ADMIN');
    // Both mappings together, as DelegatingJwtGrantedAuthoritiesConverter combines converters.
    expect([...authoritiesFrom(claims), ...authoritiesFrom(claims, roles)]).toEqual([
      'SCOPE_orders:read',
      'ROLE_admin',
      'ROLE_support',
    ]);
  });
});
