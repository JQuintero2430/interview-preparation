// @ts-check
// Section 8 (SEC-M33-08): the token-storage API. `POST /api/m33/tokens/login?mode=bearer` returns an access token
// in the body; `?mode=cookie` sets it as an HttpOnly session cookie instead. `GET /api/m33/tokens/me` accepts either.
// Node built-ins only.
import { randomBytes } from 'node:crypto';

const PREFIX = '/api/m33/tokens/';
const SESSION_COOKIE = 'm33-session';
/** Every credential this server issued (a lab: nothing expires). */
const issued = new Set();

/**
 * @param {import('node:http').ServerResponse} res @param {number} status @param {unknown} body
 * @param {Record<string, string>} [headers]
 */
function sendJson(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json', ...headers }).end(JSON.stringify(body));
}

/**
 * The bearer token from `Authorization`, else the session cookie.
 * @param {import('node:http').IncomingMessage} req @returns {{ kind: 'bearer' | 'cookie', value: string } | null}
 */
function credentialOf(req) {
  const bearer = /^Bearer (\S+)$/.exec(req.headers.authorization ?? '');
  if (bearer) return { kind: 'bearer', value: bearer[1] };
  const cookie = new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`).exec(req.headers.cookie ?? '');
  return cookie ? { kind: 'cookie', value: cookie[1] } : null;
}

/** @type {import('../security-server.mjs').RouteModule} */
export default {
  name: '08-tokens',
  match: (url) => url.pathname.startsWith(PREFIX),
  handle(req, res, url, ctx) {
    if (url.pathname === `${PREFIX}login` && req.method === 'POST') {
      const secret = randomBytes(16).toString('base64url');
      issued.add(secret);
      if (url.searchParams.get('mode') === 'cookie') {
        ctx.log({ issued: 'cookie' });
        return sendJson(res, 200, {}, { 'set-cookie': `${SESSION_COOKIE}=${secret}; HttpOnly; SameSite=Lax; Path=/` });
      }
      ctx.log({ issued: 'bearer', token: secret });
      return sendJson(res, 200, { token: secret });
    }
    if (url.pathname === `${PREFIX}me` && req.method === 'GET') {
      const credential = credentialOf(req);
      const status = credential && issued.has(credential.value) ? 200 : 401;
      ctx.log({ me: credential?.kind ?? 'none', status });
      return status === 200 ? sendJson(res, 200, { name: 'Ada' }) : sendJson(res, 401, { error: 'sign in' });
    }
    sendJson(res, 404, { error: `no ${req.method} ${url.pathname}` });
  },
};
