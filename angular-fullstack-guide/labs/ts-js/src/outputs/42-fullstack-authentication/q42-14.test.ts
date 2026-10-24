// Output question Q42.14: five tokens through our jwt-validator.ts model of a Boot resource server with only `issuer-uri`
// (Spring is not run). Keys are generated here with WebCrypto, none is committed; `now` is a constant, no clock is read.
import {
  signJws,
  signingInputOf,
  springDefaults,
  validate,
  type Claims,
  type JoseHeader,
  type KeySet,
} from '../../modules/42-fullstack-authentication/concepts/jwt-validator';
import { captureLogs } from '../capture';

/** 2026-01-01T00:00:00Z in epoch seconds. */
const NOW = 1_767_225_600;
const ISSUER = 'https://idp.example.com';
const KID = 'idp-key-1';

function rsaKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify'],
  );
}

function claimsWith(extra: Claims = {}): Claims {
  return { iss: ISSUER, sub: 'ana', aud: 'orders-api', exp: NOW + 300, scope: 'orders:read', ...extra };
}

describe('42 · Q42.14', () => {
  it('Q42.14 valid, expired 30 s ago, other audience, alg none, unknown key', async () => {
    const issuer = await rsaKeyPair();
    const stranger = await rsaKeyPair();
    const jwks: KeySet = new Map([[KID, issuer.publicKey]]);
    const header: JoseHeader = { alg: 'RS256', typ: 'JWT', kid: KID };
    const unsigned = `${signingInputOf({ alg: 'none', typ: 'JWT' }, claimsWith())}.`;
    const tokens: readonly (readonly [string, string])[] = [
      ['valid', await signJws(header, claimsWith(), issuer.privateKey)],
      ['expired 30 s ago', await signJws(header, claimsWith({ exp: NOW - 30 }), issuer.privateKey)],
      ['other audience', await signJws(header, claimsWith({ aud: 'billing-api' }), issuer.privateKey)],
      ['alg none', unsigned],
      ['unknown key', await signJws(header, claimsWith(), stranger.privateKey)],
    ];
    const policy = springDefaults(ISSUER);

    const lines = await captureLogs(async (log) => {
      for (const [label, token] of tokens) {
        const result = await validate(token, jwks, policy, NOW);
        log(`${label}: ${result.valid ? 'accepted' : `rejected (${result.reason})`}`);
      }
    });

    expect(lines).toEqual([
      'valid: accepted',
      'expired 30 s ago: accepted',
      'other audience: accepted',
      'alg none: rejected (algorithm)',
      'unknown key: rejected (signature)',
    ]);
  });
});
