// Section 1 model: a JWT signer and verifier over WebCrypto ES256. Our model, not Spring's code.
// It mirrors what Spring Security 7.1.1's resource server does with a bearer JWT (jwt.adoc: check the signature,
// then the exp and nbf timestamps) using RFC 7519 §3, §4.1.4 and §7.2, RFC 7515 §5.1 and RFC 7518 §3.4 (ES256).
// It checks the signature and `exp` only: `nbf`, `iss` and `aud` belong to the resource-server section.
// Time is an argument (epoch seconds), keys come from the caller, and nothing here reads a clock or the network.

export interface JwtHeader {
  readonly alg: string;
  readonly typ: string;
}

export interface JwtClaims {
  readonly sub: string;
  /** Expiration time in epoch seconds (RFC 7519 §4.1.4). */
  readonly exp: number;
  readonly roles: readonly string[];
}

export interface DecodedJwt {
  readonly header: JwtHeader;
  readonly claims: JwtClaims;
  /** The text the signature covers: the encoded header, a dot and the encoded payload (RFC 7515 §5.1). */
  readonly signingInput: string;
  readonly signature: Uint8Array<ArrayBuffer>;
}

export type JwtVerification =
  | { readonly valid: true; readonly claims: JwtClaims }
  | { readonly valid: false; readonly reason: 'malformed' | 'signature' | 'expired' };

export class MalformedJwtError extends Error {}

const ES256: EcdsaParams = { name: 'ECDSA', hash: 'SHA-256' };
/** RFC 7518 §3.4: "The JWS Signature value MUST be a 64-octet sequence" for ES256. */
const ES256_SIGNATURE_BYTES = 64;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8', { fatal: true });

/** Encodes bytes as base64url without padding (RFC 7515 §2). `bytes` is any byte array; returns the text. */
export function base64UrlEncode(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

/** Decodes base64url text to bytes; `text` may omit padding. Throws when a character is not base64url. */
export function base64UrlDecode(text: string): Uint8Array<ArrayBuffer> {
  const base64 = text.replaceAll('-', '+').replaceAll('_', '/');
  const binary = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function encodeJson(value: object): string {
  return base64UrlEncode(textEncoder.encode(JSON.stringify(value)));
}

function parseSegment(segment: string): unknown {
  const value: unknown = JSON.parse(textDecoder.decode(base64UrlDecode(segment)));
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function readHeader(value: unknown): JwtHeader {
  if (!isRecord(value)) throw new MalformedJwtError('the header must be a JSON object');
  const alg = value['alg'];
  const typ = value['typ'];
  if (typeof alg !== 'string' || typeof typ !== 'string') throw new MalformedJwtError('the header needs alg and typ');
  return { alg, typ };
}

function readClaims(value: unknown): JwtClaims {
  if (!isRecord(value)) throw new MalformedJwtError('the claims must be a JSON object');
  const sub = value['sub'];
  const exp = value['exp'];
  const roles = value['roles'];
  if (typeof sub !== 'string' || typeof exp !== 'number' || !isStringArray(roles)) {
    throw new MalformedJwtError('the claims need sub, exp and roles');
  }
  return { sub, exp, roles };
}

/** Signs the claims with an ECDSA P-256 private key and returns the compact serialization. */
export async function signJwt(claims: JwtClaims, privateKey: CryptoKey): Promise<string> {
  const header: JwtHeader = { alg: 'ES256', typ: 'JWT' };
  const signingInput = `${encodeJson(header)}.${encodeJson(claims)}`;
  const signature = await crypto.subtle.sign(ES256, privateKey, textEncoder.encode(signingInput));
  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

/** Reads the header and claims of a token. It takes no key, so it proves nothing about who wrote them. */
export function decodeJwt(token: string): DecodedJwt {
  const parts = token.split('.');
  if (parts.length !== 3) throw new MalformedJwtError('a compact JWT has three dot-separated parts');
  const [header = '', payload = '', signature = ''] = parts;
  try {
    return {
      header: readHeader(parseSegment(header)),
      claims: readClaims(parseSegment(payload)),
      signingInput: `${header}.${payload}`,
      signature: base64UrlDecode(signature),
    };
  } catch (error) {
    if (error instanceof MalformedJwtError) throw error;
    throw new MalformedJwtError('a part is not base64url-encoded JSON', { cause: error });
  }
}

function tryDecode(token: string): DecodedJwt | undefined {
  try {
    return decodeJwt(token);
  } catch (error) {
    if (error instanceof MalformedJwtError) return undefined;
    throw error;
  }
}

async function signatureMatches(decoded: DecodedJwt, publicKey: CryptoKey): Promise<boolean> {
  if (decoded.header.alg !== 'ES256' || decoded.signature.length !== ES256_SIGNATURE_BYTES) return false;
  return crypto.subtle.verify(ES256, publicKey, decoded.signature, textEncoder.encode(decoded.signingInput));
}

/** Verifies the signature, then that `now` is before `exp` (RFC 7519 §4.1.4). `now` is epoch seconds. */
export async function verifyJwt(token: string, publicKey: CryptoKey, now: number): Promise<JwtVerification> {
  const decoded = tryDecode(token);
  if (decoded === undefined) return { valid: false, reason: 'malformed' };
  if (!(await signatureMatches(decoded, publicKey))) return { valid: false, reason: 'signature' };
  if (now >= decoded.claims.exp) return { valid: false, reason: 'expired' };
  return { valid: true, claims: decoded.claims };
}
