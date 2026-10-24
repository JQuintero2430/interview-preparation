// Section 5 model: the checks a Spring Boot 4.1.1 resource server runs on a bearer JWT. Our model, not Spring's code.
// It mirrors Spring Security 7.1.1's NimbusJwtDecoder.decode (an unsigned token is refused, then the algorithm
// allow-list and the signature against a JWKS key) and the validators Boot 4.1.1's JwtDecoderConfiguration passes to
// JwtValidators.createDefaultWithValidators: JwtTypeValidator.jwt(), JwtTimestampValidator (60 s of clock skew),
// JwtIssuerValidator for `issuer-uri`, and an `aud` check only when `audiences` is set (facts F14, C8). Spring
// collects every validator's error; ours stops at the first. RFC 7515 §5.1, RFC 7517 §4.5 and §5, RFC 7519 §4.1.
// Keys and `now` (epoch seconds) are arguments: nothing here reads a clock or the network.
import { base64UrlDecode, base64UrlEncode } from './jwt';

export interface JoseHeader {
  readonly alg: string;
  readonly typ?: string;
  readonly kid?: string;
}

/** A token's claims as JSON: `iss`, `aud`, `exp`, `nbf`, `scope` and whatever else the issuer adds. */
export type Claims = Readonly<Record<string, unknown>>;

/** A JWKS reduced to what verification needs: each public key under its `kid` (RFC 7517 §4.5, §5). */
export type KeySet = ReadonlyMap<string, CryptoKey>;

export interface ResourceServerPolicy {
  /** Boot's `issuer-uri`: `iss` must equal it. */
  readonly issuer: string;
  /** Boot's `audiences`: `aud` must contain one of them. An empty list skips the check. */
  readonly audiences: readonly string[];
  /** The algorithm allow-list: `jws-algorithms` with `jwk-set-uri`, the JWKS keys' algorithms with only `issuer-uri`. */
  readonly algorithms: readonly string[];
  readonly clockSkewSeconds: number;
  /** Accepted `typ` values, compared ignoring case. */
  readonly types: readonly string[];
  /** Whether a token without `typ` passes, as `JwtTypeValidator.jwt()` allows. */
  readonly allowMissingType: boolean;
}

/** Our mirror of Boot's defaults with only `issuer-uri`, for an issuer whose JWKS holds RS256 keys. */
export function springDefaults(issuer: string): ResourceServerPolicy {
  return { issuer, audiences: [], algorithms: ['RS256'], clockSkewSeconds: 60, types: ['JWT'], allowMissingType: true };
}

export type RejectReason =
  | 'malformed'
  | 'algorithm'
  | 'signature'
  | 'type'
  | 'expired'
  | 'not-yet-valid'
  | 'issuer'
  | 'audience';

export type TokenValidation =
  | { readonly valid: true; readonly header: JoseHeader; readonly claims: Claims }
  | { readonly valid: false; readonly reason: RejectReason };

interface ParsedToken {
  readonly header: JoseHeader;
  readonly claims: Claims;
  readonly signingInput: string;
  readonly signature: Uint8Array<ArrayBuffer>;
}

interface CheckInput {
  readonly header: JoseHeader;
  readonly claims: Claims;
  readonly policy: ResourceServerPolicy;
  readonly now: number;
}

/** WebCrypto parameters for the JWS algorithms we model (RFC 7518 §3.3, §3.4). Anything else cannot be verified. */
const SIGNING: Readonly<Record<string, Algorithm | EcdsaParams>> = {
  RS256: { name: 'RSASSA-PKCS1-v1_5' },
  ES256: { name: 'ECDSA', hash: 'SHA-256' },
};
const UNSIGNED = 'none';
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8', { fatal: true });

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOptional<T>(value: unknown, type: 'string' | 'number'): value is T | undefined {
  return value === undefined || typeof value === type;
}

function encodeJson(value: object): string {
  return base64UrlEncode(textEncoder.encode(JSON.stringify(value)));
}

function decodeJson(segment: string): unknown {
  const value: unknown = JSON.parse(textDecoder.decode(base64UrlDecode(segment)));
  return value;
}

function readHeader(value: unknown): JoseHeader | undefined {
  if (!isRecord(value)) return undefined;
  const alg = value['alg'];
  const typ = value['typ'];
  const kid = value['kid'];
  if (typeof alg !== 'string' || !isOptional<string>(typ, 'string') || !isOptional<string>(kid, 'string')) return undefined;
  return { alg, typ, kid };
}

/** RFC 7519 §4.1.4 and §4.1.5: `exp` and `nbf`, when present, "MUST be a number". */
function readClaims(value: unknown): Claims | undefined {
  if (!isRecord(value) || !isOptional<number>(value['exp'], 'number') || !isOptional<number>(value['nbf'], 'number')) {
    return undefined;
  }
  return value;
}

function parse(token: string): ParsedToken | undefined {
  const parts = token.split('.');
  if (parts.length !== 3) return undefined;
  const [header = '', payload = '', signature = ''] = parts;
  try {
    const parsedHeader = readHeader(decodeJson(header));
    const claims = readClaims(decodeJson(payload));
    if (parsedHeader === undefined || claims === undefined) return undefined;
    return { header: parsedHeader, claims, signingInput: `${header}.${payload}`, signature: base64UrlDecode(signature) };
  } catch {
    return undefined; // a part that is not base64url-encoded JSON
  }
}

/** The text a JWS signature covers: the encoded header, a dot and the encoded claims (RFC 7515 §5.1). */
export function signingInputOf(header: JoseHeader, claims: Claims): string {
  return `${encodeJson(header)}.${encodeJson(claims)}`;
}

/** The issuer's side, for tests: signs with a private key whose type matches `header.alg` (RS256 or ES256). */
export async function signJws(header: JoseHeader, claims: Claims, privateKey: CryptoKey): Promise<string> {
  const params = SIGNING[header.alg];
  if (params === undefined) throw new Error(`our model cannot sign ${header.alg}`);
  const signingInput = signingInputOf(header, claims);
  const signature = await crypto.subtle.sign(params, privateKey, textEncoder.encode(signingInput));
  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

/**
 * Tries the key under the header's `kid`, or every key when there is none. A key verifies only the algorithm of its own
 * type, as RFC 8725 §3.1 asks ("each key MUST be used with exactly one algorithm").
 */
async function signatureMatches(token: ParsedToken, keys: KeySet): Promise<boolean> {
  const params = SIGNING[token.header.alg];
  if (params === undefined) return false;
  const data = textEncoder.encode(token.signingInput);
  const candidates = token.header.kid === undefined ? [...keys.values()] : [keys.get(token.header.kid)];
  for (const key of candidates) {
    if (key === undefined || key.algorithm.name !== params.name) continue;
    const verified = await crypto.subtle.verify(params, key, token.signature, data).catch(() => false);
    if (verified) return true;
  }
  return false;
}

/** Like `JwtTypeValidator`: a blank or missing `typ` passes only when allowed; otherwise it must match, ignoring case. */
function checkType({ header, policy }: CheckInput): RejectReason | undefined {
  const typ = header.typ?.trim() ?? '';
  if (typ === '' && policy.allowMissingType) return undefined;
  return policy.types.some((type) => type.toLowerCase() === typ.toLowerCase()) ? undefined : 'type';
}

/** Like `JwtTimestampValidator`: refuses only when `now` minus the skew is after `exp`, or plus the skew before `nbf`. */
function checkTimestamps({ claims, policy, now }: CheckInput): RejectReason | undefined {
  const exp = claims['exp'];
  const nbf = claims['nbf'];
  if (typeof exp === 'number' && now - policy.clockSkewSeconds > exp) return 'expired';
  if (typeof nbf === 'number' && now + policy.clockSkewSeconds < nbf) return 'not-yet-valid';
  return undefined;
}

function checkIssuer({ claims, policy }: CheckInput): RejectReason | undefined {
  return claims['iss'] === policy.issuer ? undefined : 'issuer';
}

/** Boot adds this check only when `audiences` is non-empty; then `aud` (a string or a list) must share a value. */
function checkAudience({ claims, policy }: CheckInput): RejectReason | undefined {
  if (policy.audiences.length === 0) return undefined;
  const aud = claims['aud'];
  const values: readonly unknown[] = Array.isArray(aud) ? aud : [aud];
  return values.some((value) => typeof value === 'string' && policy.audiences.includes(value)) ? undefined : 'audience';
}

/** In `createDefaultWithValidators` order: type, timestamps, issuer, audience (its certificate-binding check is not modelled). */
const CHECKS = [checkType, checkTimestamps, checkIssuer, checkAudience] as const;

/** Decodes, checks the algorithm and the signature, then runs the claim checks. `now` is epoch seconds. */
export async function validate(
  token: string,
  keys: KeySet,
  policy: ResourceServerPolicy,
  now: number,
): Promise<TokenValidation> {
  const parsed = parse(token);
  if (parsed === undefined) return { valid: false, reason: 'malformed' };
  const { header, claims } = parsed;
  if (header.alg === UNSIGNED || !policy.algorithms.includes(header.alg)) return { valid: false, reason: 'algorithm' };
  if (!(await signatureMatches(parsed, keys))) return { valid: false, reason: 'signature' };
  const reason = CHECKS.map((check) => check({ header, claims, policy, now })).find((found) => found !== undefined);
  return reason === undefined ? { valid: true, header, claims } : { valid: false, reason };
}
