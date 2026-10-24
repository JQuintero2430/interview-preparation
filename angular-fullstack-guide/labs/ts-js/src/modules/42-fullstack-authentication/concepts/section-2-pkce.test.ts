// Section 2 claims, about our model (pkce.ts): the S256 challenge matches RFC 7636's example, a generated verifier is
// 43 to 128 unreserved characters, the authorization URL carries the parameters a public client must send and never
// the verifier, and a callback with another state is refused. Randomness is a known byte sequence; no clock, no network.
import { challengeFor, createPkcePair, startAuthorization, stateMatches, verifyPkce, type RandomBytes } from './pkce';

/** RFC 7636 Appendix B: the 32 octets, the verifier they encode to, and its S256 challenge. */
const RFC_OCTETS = Uint8Array.from([
  116, 24, 223, 180, 151, 153, 224, 37, 79, 250, 96, 125, 216, 173, 187, 186, 22, 212, 37, 77, 105, 214, 191, 240, 91,
  88, 5, 88, 83, 132, 141, 121,
]);
const RFC_VERIFIER = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
const RFC_CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

const config = {
  authorizationEndpoint: 'https://idp.example.com/authorize',
  clientId: 'angular-app',
  redirectUri: 'https://app.example.com/callback',
  scope: 'openid profile',
};

/** A different, repeatable byte sequence on every call: call n, position i gives (n * 31 + i) mod 256. */
function countingRandom(): RandomBytes {
  let call = 0;
  return (length) => {
    const bytes = Uint8Array.from({ length }, (_, index) => (call * 31 + index) % 256);
    call++;
    return bytes;
  };
}

describe('Module 42 · section 2', () => {
  it("Section 2: the S256 challenge for RFC 7636's example verifier matches the RFC", async () => {
    expect(await challengeFor(RFC_VERIFIER)).toBe(RFC_CHALLENGE);
    // The RFC's octets, fed through the injected source, give the RFC's verifier and challenge.
    expect(await createPkcePair(() => RFC_OCTETS)).toEqual({ verifier: RFC_VERIFIER, challenge: RFC_CHALLENGE });
    // The token endpoint's comparison: the right verifier passes, one changed character fails.
    expect(await verifyPkce(RFC_VERIFIER, RFC_CHALLENGE)).toBe(true);
    expect(await verifyPkce(`${RFC_VERIFIER.slice(0, -1)}A`, RFC_CHALLENGE)).toBe(false);
  });

  it('Section 2: a generated verifier is 43 to 128 unreserved characters', async () => {
    const random = countingRandom();
    for (let attempt = 0; attempt < 5; attempt++) {
      const { verifier } = await createPkcePair(random);
      // RFC 7636 §4.1: 43*128 of ALPHA / DIGIT / "-" / "." / "_" / "~".
      expect(verifier).toMatch(/^[A-Za-z0-9\-._~]{43,128}$/);
      expect(verifier).toHaveLength(43);
    }
  });

  it('Section 2: the authorization URL carries response_type code, S256, state and nonce', async () => {
    const { url, pending } = await startAuthorization(config, countingRandom());
    const { origin, pathname, searchParams } = new URL(url);
    expect(origin + pathname).toBe(config.authorizationEndpoint);
    expect(searchParams.get('response_type')).toBe('code');
    expect(searchParams.get('client_id')).toBe('angular-app');
    expect(searchParams.get('redirect_uri')).toBe(config.redirectUri);
    expect(searchParams.get('scope')).toBe('openid profile');
    expect(searchParams.get('code_challenge_method')).toBe('S256');
    expect(searchParams.get('code_challenge')).toBe(await challengeFor(pending.verifier));
    expect(searchParams.get('state')).toBe(pending.state);
    expect(searchParams.get('nonce')).toBe(pending.nonce);
    // Three independent random values; the verifier itself stays in the page.
    expect(new Set([pending.state, pending.nonce, pending.verifier]).size).toBe(3);
    expect(url).not.toContain(pending.verifier);
  });

  it('Section 2: a callback whose state differs from the stored one is rejected', async () => {
    const { pending } = await startAuthorization(config, countingRandom());
    const callback = (query: string): string => `${config.redirectUri}?${query}`;
    expect(stateMatches(callback(`code=abc&state=${pending.state}`), pending)).toBe(true);
    expect(stateMatches(callback('code=abc&state=another-value'), pending)).toBe(false);
    expect(stateMatches(callback('code=abc'), pending)).toBe(false);
  });
});
