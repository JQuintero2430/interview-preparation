// @ts-check
// Exercise 33.4 (EX-M33-04), the solution: an access token the page keeps in memory and a refresh token in an
// HttpOnly cookie. Node built-ins only. Under `/api/m33/ex4/a/`:
// - `POST login` answers `{ accessToken }` and sets the refresh cookie (`HttpOnly; SameSite=Strict; Path=/api/m33/ex4/a/refresh`).
// - `POST refresh` answers a new `{ accessToken }` when the refresh cookie is valid (else 401); `DELETE refresh` revokes
//   the refresh token and every access token minted from it, and clears the cookie (204).
// - `GET data` is the bearer API: it needs `Authorization: Bearer <access token>` (else 401). `ex4-tokens-b.mjs` calls it too.
// `/m33/ex4/a/attacker` is served only on host `127.0.0.1` (another site than `localhost`) and calls the API with credentials.
// The helpers are exported for `ex4-tokens-b.mjs`; the loader uses only the default export.
import { randomBytes } from 'node:crypto';

const API = '/api/m33/ex4/a/';
const ATTACKER = '/m33/ex4/a/attacker';
const REFRESH_COOKIE = 'm33-ex4a-refresh';
/** @type {Map<string, Set<string>>} Refresh token to the access tokens minted from it (a lab: nothing expires). */
const refreshTokens = new Map();
/** @type {Set<string>} Every access token that is still valid. */
const accessTokens = new Set();

/**
 * @param {import('node:http').ServerResponse} res @param {number} status @param {unknown} [body]
 * @param {Record<string, string>} [headers]
 */
export function sendJson(res, status, body, headers = {}) {
  if (body === undefined) return res.writeHead(status, headers).end();
  res.writeHead(status, { 'content-type': 'application/json', ...headers }).end(JSON.stringify(body));
}

/** @param {import('node:http').IncomingMessage} req @returns {Map<string, string>} */
export function cookiesOf(req) {
  const pairs = (req.headers.cookie ?? '').split(/;\s*/).filter(Boolean);
  return new Map(pairs.map((pair) => [pair.slice(0, pair.indexOf('=')), pair.slice(pair.indexOf('=') + 1)]));
}

/** @returns {string} */
function secret() {
  return randomBytes(16).toString('base64url');
}

/** Mints an access token the bearer API accepts. */
export function mintAccessToken() {
  const token = secret();
  accessTokens.add(token);
  return token;
}

/** @param {string} token */
export function revokeAccessToken(token) {
  accessTokens.delete(token);
}

/**
 * Logs what reached an API route: the cookies (the run cookie left out), whether a bearer token came, the browser's
 * `Sec-Fetch-Site` and the status.
 * @param {'a' | 'b'} variant @param {string} route @param {import('node:http').IncomingMessage} req
 * @param {import('../security-server.mjs').RouteContext} ctx @param {number} status
 */
export function logRequest(variant, route, req, ctx, status) {
  ctx.log({
    ex4: variant,
    route,
    method: req.method,
    cookies: [...cookiesOf(req).keys()].filter((name) => name !== 'm33-run').sort(),
    bearer: /^Bearer \S+$/.test(req.headers.authorization ?? ''),
    secFetchSite: req.headers['sec-fetch-site'] ?? null,
    status,
  });
}

/**
 * Serves the attacker page on `127.0.0.1`: it calls the variant's restore route and its data route with credentials.
 * @param {import('node:http').IncomingMessage} req @param {import('node:http').ServerResponse} res
 * @param {{ method: string, path: string }[]} targets @param {string} run
 */
export function attacker(req, res, targets, run) {
  const port = (req.headers.host ?? '').split(':')[1] ?? '4500';
  const calls = targets.map(({ method, path }) => {
    const url = `http://localhost:${port}${path}?run=${encodeURIComponent(run)}`;
    return `fetch(${JSON.stringify(url)}, { method: ${JSON.stringify(method)}, credentials: 'include' }).catch(() => {});`;
  });
  res
    .writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
    .end(`<!doctype html><meta charset="utf-8"><title>Prize</title><p>You won a prize.</p><script>${calls.join('')}</script>`);
}

/** The status of the bearer API for a request. @param {import('node:http').IncomingMessage} req */
function dataStatus(req) {
  const bearer = /^Bearer (\S+)$/.exec(req.headers.authorization ?? '');
  return bearer && accessTokens.has(bearer[1]) ? 200 : 401;
}

/**
 * Mints an access token for a known refresh token and records it, so a logout can revoke it.
 * @param {string} refresh @returns {Answer}
 */
function grant(refresh) {
  const accessToken = mintAccessToken();
  refreshTokens.get(refresh)?.add(accessToken);
  return { status: 200, body: { accessToken } };
}

/** @typedef {{ status: number, body?: unknown, headers?: Record<string, string> }} Answer */

/**
 * The decision for a route under `/api/m33/ex4/a/`.
 * @param {import('node:http').IncomingMessage} req @param {string} route @returns {Answer}
 */
function answer(req, route) {
  const refresh = cookiesOf(req).get(REFRESH_COOKIE) ?? '';
  const tokens = refreshTokens.get(refresh);
  if (route === 'login' && req.method === 'POST') {
    const created = secret();
    refreshTokens.set(created, new Set());
    const cookie = `${REFRESH_COOKIE}=${created}; HttpOnly; SameSite=Strict; Path=${API}refresh`;
    return { ...grant(created), headers: { 'set-cookie': cookie } };
  }
  if (route === 'refresh' && req.method === 'POST') return tokens ? grant(refresh) : { status: 401, body: { error: 'sign in' } };
  if (route === 'refresh' && req.method === 'DELETE') {
    for (const token of tokens ?? []) revokeAccessToken(token);
    refreshTokens.delete(refresh);
    return { status: 204, headers: { 'set-cookie': `${REFRESH_COOKIE}=; Max-Age=0; HttpOnly; SameSite=Strict; Path=${API}refresh` } };
  }
  if (route === 'data' && req.method === 'GET') {
    const status = dataStatus(req);
    return { status, body: status === 200 ? { owner: 'Ada', invoices: 3 } : { error: 'sign in' } };
  }
  return { status: 404, body: { error: `no ${req.method} ${route}` } };
}

/** @type {import('../security-server.mjs').RouteModule} */
export default {
  name: 'ex4-tokens-a',
  match: (url, host) => url.pathname.startsWith(API) || (host === '127.0.0.1' && url.pathname === ATTACKER),
  handle(req, res, url, ctx) {
    if (url.pathname === ATTACKER) {
      const targets = [{ method: 'POST', path: `${API}refresh` }, { method: 'GET', path: `${API}data` }];
      return attacker(req, res, targets, ctx.run);
    }
    req.resume();
    const route = url.pathname.slice(API.length);
    const { status, body, headers } = answer(req, route);
    logRequest('a', route, req, ctx, status);
    sendJson(res, status, body, headers);
  },
};
