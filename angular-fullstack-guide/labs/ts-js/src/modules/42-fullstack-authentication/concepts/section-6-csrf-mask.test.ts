// Section 6 claims, about our model (csrf-mask.ts) of Spring Security 7.1.1's XorCsrfTokenRequestAttributeHandler and
// of the resolver csrf.spa() installs. The token has the shape of CookieCsrfTokenRepository's tokens (a UUID string);
// the random source is a counter, so every run is the same (no Math.random, no clock).
import type { RandomBytes } from './pkce';
import { maskToken, resolveMasked, resolveSpa } from './csrf-mask';

const STORED = '3f1c2a9e-7b4d-4e8a-9c61-0d5b7e2f4a18';

/** Our injected source: each call fills its bytes from a different starting value. */
function countingRandom(): RandomBytes {
  let call = 0;
  return (length) => {
    call++;
    return Uint8Array.from({ length }, (_, index) => (call * 31 + index) % 256);
  };
}

describe('Module 42 · section 6', () => {
  it('Section 6: our masked token differs on every response and unmasks to the same value', () => {
    const random = countingRandom();
    const first = maskToken(STORED, random);
    const second = maskToken(STORED, random);

    expect(first).not.toBe(second);
    expect(first).not.toBe(STORED);
    // 36 random bytes plus 36 masked bytes: 72 bytes, 96 base64url characters.
    expect(first).toHaveLength(96);
    expect(resolveMasked(first, STORED)).toBe(STORED);
    expect(resolveMasked(second, STORED)).toBe(STORED);
  });

  it('Section 6: the raw cookie value fails the masked resolver and passes the raw one', () => {
    // 36 base64url characters decode to 27 bytes, not the 72 that a mask of a 36-byte token has.
    expect(resolveMasked(STORED, STORED)).toBeNull();
    expect(resolveSpa({ header: STORED }, STORED)).toBe(STORED);

    const masked = maskToken(STORED, countingRandom());
    // spa(): a form's _csrf parameter still goes through the XOR resolver ...
    expect(resolveSpa({ parameter: masked }, STORED)).toBe(STORED);
    // ... but a masked value sent in the header is taken as sent, so it does not equal the stored token.
    expect(resolveSpa({ header: masked }, STORED)).toBe(masked);
    expect(resolveSpa({}, STORED)).toBeNull();
  });
});
