// Section 8: helpers that build the nonce, the hash source and the strict policy string described by web.dev's strict CSP guide.

/** A fresh nonce: 16 random bytes (128 bits), base64 encoded. Generate one per response, never reuse it. */
export const createNonce = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes));
};

/** A hash source expression: `'sha256-'` plus the base64 SHA-256 of the exact script text, quotes included. */
export const hashSource = async (scriptText: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(scriptText));
  return `'sha256-${btoa(String.fromCharCode(...new Uint8Array(digest)))}'`;
};

/** The nonce-based strict policy: trusted scripts carry the nonce, `'strict-dynamic'` extends trust to what they load. */
export const strictCsp = (nonce: string): string =>
  `script-src 'nonce-${nonce}' 'strict-dynamic'; object-src 'none'; base-uri 'none';`;
