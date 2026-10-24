// Section 6 model: Spring Security 7.1.1's XorCsrfTokenRequestAttributeHandler (BREACH masking) and the resolver that
// csrf.spa() installs (CsrfConfigurer's private SpaCsrfTokenRequestHandler; facts F16, C2). Our model, not Spring's code.
// Masking: random bytes as long as the token's UTF-8 bytes, then those bytes XOR the token, base64url-encoded together.
// Resolving decodes, refuses a value whose length is not twice the token's, and XORs the halves back. CsrfFilter then
// compares the result with the stored token in constant time; the tests compare with `toBe`. Spring's encoder pads
// with '='; a 36-character token masks to 72 bytes, which needs no padding. Random bytes come from the caller.
import { base64UrlDecode, base64UrlEncode } from './jwt';
import type { RandomBytes } from './pkce';

/** What a request sends: the `X-XSRF-TOKEN` header, the `_csrf` form parameter, or neither. */
export interface CsrfAttempt {
  readonly header?: string;
  readonly parameter?: string;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function xor(left: Uint8Array, right: Uint8Array): Uint8Array {
  return left.map((byte, index) => byte ^ (right[index] ?? 0));
}

function decodeOrNull(text: string): Uint8Array | null {
  try {
    return base64UrlDecode(text);
  } catch {
    return null;
  }
}

/** The value a response body may carry for `token`: different on every call, because `random` is. */
export function maskToken(token: string, random: RandomBytes): string {
  const tokenBytes = encoder.encode(token);
  const randomBytes = random(tokenBytes.length);
  const combined = new Uint8Array(tokenBytes.length * 2);
  combined.set(randomBytes);
  combined.set(xor(randomBytes, tokenBytes), tokenBytes.length);
  return base64UrlEncode(combined);
}

/** The XOR handler's resolver: the token hidden in `sent`, or `null` when `sent` is not a mask of `stored`'s length. */
export function resolveMasked(sent: string, stored: string): string | null {
  const size = encoder.encode(stored).length;
  const bytes = decodeOrNull(sent);
  if (bytes === null || bytes.length !== size * 2) return null;
  return decoder.decode(xor(bytes.subarray(0, size), bytes.subarray(size)));
}

/** spa()'s resolver: a header with text is taken as sent; otherwise the XOR handler resolves the header or parameter. */
export function resolveSpa(attempt: CsrfAttempt, stored: string): string | null {
  if (attempt.header !== undefined && attempt.header.trim() !== '') return attempt.header;
  const sent = attempt.header ?? attempt.parameter;
  return sent === undefined ? null : resolveMasked(sent, stored);
}
