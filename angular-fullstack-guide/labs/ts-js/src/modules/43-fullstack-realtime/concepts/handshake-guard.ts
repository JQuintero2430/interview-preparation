// Section 7 model: the checks a STOMP-over-WebSocket connection passes in Spring, mirrored from spring-framework v7.0.9
// `OriginHandshakeInterceptor.beforeHandshake`, `WebUtils.isSameOrigin` and `StompSubProtocolHandler.sendErrorMessage`
// (F25, C2); spring-security 7.1.1 `CsrfTokenHandshakeInterceptor.beforeHandshake`, `XorCsrfChannelInterceptor.preSend`,
// `XorCsrfTokenUtils.getTokenValue`, `XorCsrfTokenRequestAttributeHandler` (the mask), the interceptor order in
// `WebSocketMessageBrokerSecurityConfiguration` (internal) and `MessageMatcherDelegatingAuthorizationManager.authorize`
// (F27, F28, C4); and the token `ChannelInterceptor` of spring-framework v7.0.9 `authentication-token-based.adoc` (F24);
// all read 2026-10-21. Our model, not Spring's code. Random bytes and the token check are injected; nothing here reads
// a clock or opens a connection. Our simplifications: an allowed origin matches exactly, a destination pattern is exact
// or ends in `/**`, and a refusal is an `Error` whose message the ERROR frame carries.
import type { StompFrame } from './stomp-frame';

/** What the origin check sees of a handshake: the `Origin` header and the request's own scheme, host and port. */
export interface HandshakeRequest {
  readonly origin?: string;
  readonly scheme: 'http' | 'https';
  readonly host: string;
  readonly port: number;
  /** The raw token `CsrfFilter` loaded for this request (the `XSRF-TOKEN` cookie value), if CSRF runs on HTTP. */
  readonly csrfToken?: string;
}

/** The WebSocket session attributes; Spring keys the token by `CsrfToken`'s class name. */
export interface SessionAttributes {
  readonly expectedCsrfToken?: string;
}

export type HandshakeResult =
  | { readonly status: 101; readonly attributes: SessionAttributes }
  | { readonly status: 403 };

export interface Principal {
  readonly name: string;
  readonly roles: readonly string[];
}

/** One inbound message: the frame, the attributes copied at the handshake, and the user once one is set. */
export interface InboundMessage {
  readonly frame: StompFrame;
  readonly attributes: SessionAttributes;
  readonly user?: Principal;
}

/** A `ChannelInterceptor`'s `preSend`: returns the message, possibly with a user, or throws to refuse it. */
export type Interceptor = (message: InboundMessage) => InboundMessage;

/** Without an error handler, Spring answers a refused message with an ERROR frame and closes with 1002. */
export type InboundResult =
  | { readonly accepted: InboundMessage }
  | { readonly error: StompFrame; readonly closeCode: 1002 };

export type RandomBytes = (size: number) => Uint8Array;

/** Stands in for `JwtDecoder.decode`: returns the token's principal, or throws as `decode` throws a `JwtException`. */
export type VerifyToken = (token: string) => Principal;

const DEFAULT_PORTS: Readonly<Record<string, number>> = { 'http:': 80, 'https:': 443 };

// WebUtils.isSameOrigin: no Origin header passes; otherwise scheme, host and port must equal the request's own.
function sameOrigin(request: HandshakeRequest): boolean {
  if (request.origin === undefined) return true;
  const origin = new URL(request.origin);
  const port = origin.port === '' ? DEFAULT_PORTS[origin.protocol] : Number(origin.port);
  return origin.protocol === `${request.scheme}:` && origin.hostname === request.host && port === request.port;
}

/** OriginHandshakeInterceptor: 403 unless the handshake is same-origin or its origin is allowed. */
export function checkOrigin(request: HandshakeRequest, allowedOrigins: readonly string[]): 101 | 403 {
  return sameOrigin(request) || allowedOrigins.includes(request.origin ?? '') ? 101 : 403;
}

/**
 * Both handshake interceptors in Spring's order: Spring Security puts `CsrfTokenHandshakeInterceptor` first, which
 * copies the raw token into the session attributes, and Spring Framework's `OriginHandshakeInterceptor` runs last.
 */
export function handshake(request: HandshakeRequest, allowedOrigins: readonly string[]): HandshakeResult {
  const attributes: SessionAttributes = request.csrfToken === undefined ? {} : { expectedCsrfToken: request.csrfToken };
  return checkOrigin(request, allowedOrigins) === 101 ? { status: 101, attributes } : { status: 403 };
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const BASE64URL = /^[A-Za-z0-9_-]*={0,2}$/;
// The start of MissingCsrfTokenException's and InvalidCsrfTokenException's messages, and AccessDeniedException's.
const MISSING_CSRF = 'Could not verify the provided CSRF token because no token was found to compare.';
const CSRF_HEADER = 'X-XSRF-TOKEN'; // CookieCsrfTokenRepository's header name, which the expected token names
const BEARER = /^Bearer /;

function xor(left: Uint8Array, right: Uint8Array): Uint8Array {
  return left.map((byte, index) => byte ^ (right[index] ?? 0));
}

function toBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_');
}

function fromBase64Url(text: string): Uint8Array | null {
  if (!BASE64URL.test(text) || text.replace(/=+$/, '').length % 4 === 1) return null;
  const binary = atob(text.replaceAll('-', '+').replaceAll('_', '/'));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/** XorCsrfTokenRequestAttributeHandler's mask: random bytes, then those bytes XOR the token, base64url together. */
export function maskToken(token: string, random: RandomBytes): string {
  const tokenBytes = encoder.encode(token);
  const randomBytes = random(tokenBytes.length);
  const combined = new Uint8Array(tokenBytes.length * 2);
  combined.set(randomBytes);
  combined.set(xor(randomBytes, tokenBytes), tokenBytes.length);
  return toBase64Url(combined);
}

/** XorCsrfTokenUtils.getTokenValue: the token hidden in `sent`, or `null` when `sent` is not twice its length. */
export function unmaskToken(sent: string, expected: string): string | null {
  const size = encoder.encode(expected).length;
  const bytes = fromBase64Url(sent);
  if (bytes === null || bytes.length !== size * 2) return null;
  return decoder.decode(xor(bytes.subarray(0, size), bytes.subarray(size)));
}

/** XorCsrfChannelInterceptor on CONNECT: unmask the header value, then compare it with the expected raw token. */
export function checkConnectCsrf(masked: string | undefined, expected: string | undefined): void {
  if (expected === undefined) throw new Error(MISSING_CSRF);
  if (masked !== undefined && unmaskToken(masked, expected) === expected) return;
  throw new Error(`Invalid CSRF Token '${masked}'`);
}

/** Our token interceptor (HIGHEST_PRECEDENCE + 99): on CONNECT, verify `Authorization: Bearer …` and set the user. */
export function authenticateConnect(message: InboundMessage, verify: VerifyToken): InboundMessage {
  const header = message.frame.headers['Authorization'];
  if (message.frame.command !== 'CONNECT' || header === undefined) return message;
  return { ...message, user: verify(header.replace(BEARER, '')) };
}

/** The CSRF interceptor as a pipeline step: only CONNECT is checked, in the header the expected token names. */
export function csrfInterceptor(message: InboundMessage): InboundMessage {
  if (message.frame.command === 'CONNECT') {
    checkConnectCsrf(message.frame.headers[CSRF_HEADER], message.attributes.expectedCsrfToken);
  }
  return message;
}

// Message authorization: rules by message type and destination; the first match decides and no match denies.
export type Decision = 'permitAll' | 'denyAll' | 'authenticated' | { readonly hasRole: string };
export interface Rule {
  readonly matches: (frame: StompFrame) => boolean;
  readonly decision: Decision;
}

// StompCommand: SEND is a MESSAGE, SUBSCRIBE a SUBSCRIBE, CONNECT a CONNECT.
const MESSAGE_TYPES: Readonly<Record<string, string>> = { SEND: 'MESSAGE', SUBSCRIBE: 'SUBSCRIBE', CONNECT: 'CONNECT' };
const messageType = (frame: StompFrame): string => MESSAGE_TYPES[frame.command] ?? frame.command;

function destinationMatches(pattern: string, destination: string | undefined): boolean {
  if (destination === undefined) return false;
  return pattern.endsWith('/**') ? destination.startsWith(pattern.slice(0, -2)) : destination === pattern;
}

/** Builders named after `MessageMatcherDelegatingAuthorizationManager.Builder`'s matchers. */
export const matchers = {
  nullDest: (): Rule['matches'] => (frame) => frame.headers['destination'] === undefined,
  dest: (pattern: string): Rule['matches'] => (frame) => destinationMatches(pattern, frame.headers['destination']),
  subscribeDest: (pattern: string): Rule['matches'] => (frame) =>
    messageType(frame) === 'SUBSCRIBE' && destinationMatches(pattern, frame.headers['destination']),
  types: (...types: readonly string[]): Rule['matches'] => (frame) => types.includes(messageType(frame)),
  any: (): Rule['matches'] => () => true,
};

function granted(decision: Decision, user: Principal | undefined): boolean {
  if (decision === 'permitAll' || decision === 'denyAll') return decision === 'permitAll';
  if (decision === 'authenticated') return user !== undefined;
  return user?.roles.includes(decision.hasRole) ?? false;
}

/** AuthorizationChannelInterceptor over the rules: throws "Access Denied" unless the first matching rule grants. */
export function authorizationInterceptor(rules: readonly Rule[]): Interceptor {
  return (message) => {
    const rule = rules.find((candidate) => candidate.matches(message.frame));
    if (rule === undefined || !granted(rule.decision, message.user)) throw new Error('Access Denied');
    return message;
  };
}

/** The inbound channel: each interceptor in order; the first refusal becomes an ERROR frame and close code 1002. */
export function inbound(message: InboundMessage, interceptors: readonly Interceptor[]): InboundResult {
  try {
    return { accepted: interceptors.reduce((current, interceptor) => interceptor(current), message) };
  } catch (refusal) {
    const text = refusal instanceof Error ? refusal.message : String(refusal);
    return { error: { command: 'ERROR', headers: { message: text }, body: '' }, closeCode: 1002 };
  }
}
