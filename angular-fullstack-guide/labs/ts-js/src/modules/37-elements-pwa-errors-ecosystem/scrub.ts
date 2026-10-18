/** Placeholder written where personal data or a secret was removed. */
export const REDACTED = '[redacted]';

const BEARER = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const JWT = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g;
const SECRET_PARAM = /\b(access_token|id_token|refresh_token|token|api_key|password)=[^&#\s]+/gi;
const EMAIL = /[A-Za-z0-9._+-]+(?:@|%40)[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;

/** Removes bearer tokens, JWT-shaped strings, secret query parameters and e-mail addresses from a message or URL. */
export function scrub(text: string): string {
  return text
    .replace(BEARER, `Bearer ${REDACTED}`)
    .replace(JWT, REDACTED)
    .replace(SECRET_PARAM, (_match, name: string) => `${name}=${REDACTED}`)
    .replace(EMAIL, REDACTED);
}
