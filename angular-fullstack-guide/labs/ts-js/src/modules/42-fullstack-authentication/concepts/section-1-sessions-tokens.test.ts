// Section 1 claims, about our models (jwt.ts, session-store.ts): a JWT's claims are readable without a key, one changed
// claim breaks the signature check, deleting a session row ends that login, and a JWT has no row to delete.
import { base64UrlDecode, base64UrlEncode, decodeJwt, signJwt, verifyJwt, type JwtClaims } from './jwt';
import { SessionStore } from './session-store';

const claims: JwtClaims = { sub: 'ana', exp: 1_000, roles: ['user'] };
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

async function newKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
}

function counterIds(): () => string {
  let next = 0;
  return () => `sid-${++next}`;
}

describe('Module 42 · section 1', () => {
  it("Section 1: anyone can decode a JWT's claims without the key", async () => {
    const { privateKey } = await newKeyPair();
    const token = await signJwt(claims, privateKey);
    const decoded = decodeJwt(token);
    expect(decoded.header).toEqual({ alg: 'ES256', typ: 'JWT' });
    expect(decoded.claims).toEqual(claims);
    // Each part is plain base64url text (RFC 7519 §3): the payload part is the claims as readable JSON.
    const payloadPart = token.split('.')[1] ?? '';
    expect(JSON.parse(textDecoder.decode(base64UrlDecode(payloadPart)))).toEqual(claims);
    // ES256 signatures are 64 octets (RFC 7518 §3.4).
    expect(decoded.signature).toHaveLength(64);
  });

  it('Section 1: changing one claim makes the signature check fail', async () => {
    const { privateKey, publicKey } = await newKeyPair();
    const token = await signJwt(claims, privateKey);
    expect(await verifyJwt(token, publicKey, 999)).toEqual({ valid: true, claims });

    const [header = '', , signature = ''] = token.split('.');
    const forgedPayload = base64UrlEncode(textEncoder.encode(JSON.stringify({ ...claims, roles: ['admin'] })));
    const forged = `${header}.${forgedPayload}.${signature}`;
    // Decoding does not notice the change; verifying does.
    expect(decodeJwt(forged).claims.roles).toEqual(['admin']);
    expect(await verifyJwt(forged, publicKey, 999)).toEqual({ valid: false, reason: 'signature' });

    const otherKey = await newKeyPair();
    expect(await verifyJwt(token, otherKey.publicKey, 999)).toEqual({ valid: false, reason: 'signature' });
    expect(await verifyJwt('not-a-jwt', publicKey, 999)).toEqual({ valid: false, reason: 'malformed' });
  });

  it('Section 1: a revoked session id is refused on the next request', () => {
    const store = new SessionStore(counterIds());
    const phone = store.login('ana');
    const laptop = store.login('ana');
    const other = store.login('ben');
    expect(store.lookup(phone)).toEqual({ userId: 'ana' });

    expect(store.revoke(phone)).toBe(true);
    expect(store.lookup(phone)).toBeUndefined();
    expect(store.revoke(phone)).toBe(false);
    expect(store.lookup(laptop)).toEqual({ userId: 'ana' });

    // Disabling the account deletes every row of that user and no other.
    expect(store.revokeUser('ana')).toBe(1);
    expect(store.lookup(laptop)).toBeUndefined();
    expect(store.lookup(other)).toEqual({ userId: 'ben' });
  });

  it('Section 1: a JWT still verifies after logout until its exp', async () => {
    const { privateKey, publicKey } = await newKeyPair();
    const token = await signJwt(claims, privateKey);
    const store = new SessionStore(counterIds());
    const sessionId = store.login('ana');

    // "Logout": the session row is deleted. The token has no row, so nothing the server holds can be deleted.
    store.revoke(sessionId);
    expect(store.lookup(sessionId)).toBeUndefined();
    expect(await verifyJwt(token, publicKey, 100)).toEqual({ valid: true, claims });
    expect(await verifyJwt(token, publicKey, claims.exp - 1)).toEqual({ valid: true, claims });
    // RFC 7519 §4.1.4: the current time MUST be before exp, so the instant exp arrives the token is refused.
    expect(await verifyJwt(token, publicKey, claims.exp)).toEqual({ valid: false, reason: 'expired' });
  });
});
