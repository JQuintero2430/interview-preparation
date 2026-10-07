// Section 8 (Node 24, Web Crypto): the nonce, hash and strict-policy helpers. CSP and Trusted Types enforcement is browser behavior and is documented in the module, not run.
import { createNonce, hashSource, strictCsp } from './csp.js';

const decode = (base64: string): Uint8Array => Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

describe('Module 09 · section 8', () => {
  it('Section 8: a nonce is base64, at least 128 bits, and different on every call', () => {
    const nonces = Array.from({ length: 50 }, createNonce);
    expect(new Set(nonces).size).toBe(50);
    for (const nonce of nonces) {
      expect(nonce).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
      expect(decode(nonce).length).toBeGreaterThanOrEqual(16);
    }
  });

  it('Section 8: strictCsp builds the web.dev nonce-based policy', () => {
    expect(strictCsp('abc')).toBe("script-src 'nonce-abc' 'strict-dynamic'; object-src 'none'; base-uri 'none';");
  });

  it('Section 8: a hash source is the base64 SHA-256 of the exact text (known vector for the empty string)', async () => {
    expect(await hashSource('')).toBe("'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='");
  });

  it('Section 8: one extra space changes the hash, so the hash covers the exact script text', async () => {
    const script = 'console.log("hello!");';
    expect(await hashSource(script)).toBe(await hashSource(script));
    expect(await hashSource(`${script} `)).not.toBe(await hashSource(script));
  });
});
