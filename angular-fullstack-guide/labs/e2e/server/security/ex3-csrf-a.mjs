// @ts-check
// Exercise 33.3 (EX-M33-03), the solution: a transfer API behind a `SameSite=Lax` session cookie and the
// cookie-to-header token. Node built-ins only. Under `/api/m33/ex3/a/`:
// - `POST login` sets the HttpOnly session cookie (`SameSite=Lax`) and a readable `XSRF-TOKEN` cookie, both new at every login.
// - `POST transfer` needs the session (else 401) and an `X-XSRF-TOKEN` header equal to that session's token (else 403).
// - `GET transfer` answers 405; `GET account` answers how many transfers the run applied.
// `/m33/ex3/a/attacker/form` and `/fetch` are served only on host `127.0.0.1` (another site than `localhost`) and forge a transfer.
// The helpers are exported for `ex3-csrf-b.mjs`; the loader uses only the default export.
import { randomBytes } from 'node:crypto';

/** Transfers applied, by run id (a lab: nothing expires). */
const accounts = new Map();

/**
 * @param {import('node:http').ServerResponse} res @param {number} status @param {unknown} body
 * @param {Record<string, string | string[]>} [headers]
 */
export function sendJson(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json', ...headers }).end(JSON.stringify(body));
}

/** @param {import('node:http').IncomingMessage} req @returns {Map<string, string>} */
export function cookiesOf(req) {
  const pairs = (req.headers.cookie ?? '').split(/;\s*/).filter(Boolean);
  return new Map(pairs.map((pair) => [pair.slice(0, pair.indexOf('=')), pair.slice(pair.indexOf('=') + 1)]));
}

/** @param {string | string[] | undefined} value */
export function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

/** Applies one transfer to the run's account. @param {string} run */
export function applyTransfer(run) {
  accounts.set(run, (accounts.get(run) ?? 0) + 1);
}

/** @param {string} run */
export function transfersOf(run) {
  return accounts.get(run) ?? 0;
}

/**
 * Serves the attacker page on `127.0.0.1`: `form` auto-submits a POST, `fetch` sends a no-cors POST with credentials.
 * @param {string} api the variant's API prefix @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res @param {URL} url @param {string} run
 */
export function attacker(api, req, res, url, run) {
  const port = (req.headers.host ?? '').split(':')[1] ?? '4500';
  const target = `http://localhost:${port}${api}transfer?run=${encodeURIComponent(run)}`;
  const forged = url.pathname.endsWith('/form')
    ? `<form method="post" action="${target}"><input type="hidden" name="amount" value="1000"></form><script>document.forms[0].submit()</script>`
    : `<script>fetch(${JSON.stringify(target)}, { method: 'POST', credentials: 'include', mode: 'no-cors', headers: { 'content-type': 'text/plain' }, body: 'amount=1000' })</script>`;
  res
    .writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
    .end(`<!doctype html><meta charset="utf-8"><title>Prize</title><p>You won a prize.</p>${forged}`);
}

/**
 * The routes both variants share: `GET transfer`, `GET account`, and the transfer's log entry. `check` is the variant's
 * decision for a `POST transfer`: its status, 200 meaning accepted.
 * @param {string} api @param {import('node:http').IncomingMessage} req @param {import('node:http').ServerResponse} res
 * @param {URL} url @param {import('../security-server.mjs').RouteContext} ctx
 * @param {(req: import('node:http').IncomingMessage) => number} check
 */
export function transferApi(api, req, res, url, ctx, check) {
  if (url.pathname === `${api}account` && req.method === 'GET') return sendJson(res, 200, { transfers: transfersOf(ctx.run) });
  if (url.pathname !== `${api}transfer`) return sendJson(res, 404, { error: `no ${req.method} ${url.pathname}` });
  req.resume();
  const status = req.method === 'POST' ? check(req) : 405;
  if (status === 200) applyTransfer(ctx.run);
  ctx.log({
    transfer: true,
    method: req.method,
    cookies: [...cookiesOf(req).keys()].filter((name) => name !== 'm33-run').sort(),
    secFetchSite: first(req.headers['sec-fetch-site']) ?? null,
    origin: first(req.headers.origin) ?? null,
    header: first(req.headers['x-xsrf-token']) !== undefined,
    status,
  });
  sendJson(res, status, status === 200 ? { ok: true } : { error: `refused with ${status}` }, status === 405 ? { allow: 'POST' } : {});
}

const API = '/api/m33/ex3/a/';
const ATTACKER = '/m33/ex3/a/attacker/';
/** Session id to its XSRF token. */
const sessions = new Map();

/** The solution's decision: a session, then the token the session was given. @param {import('node:http').IncomingMessage} req */
function check(req) {
  const session = cookiesOf(req).get('m33-ex3a');
  const token = session === undefined ? undefined : sessions.get(session);
  if (token === undefined) return 401;
  return first(req.headers['x-xsrf-token']) === token ? 200 : 403;
}

/** @type {import('../security-server.mjs').RouteModule} */
export default {
  name: 'ex3-csrf-a',
  match: (url, host) => url.pathname.startsWith(API) || (host === '127.0.0.1' && url.pathname.startsWith(ATTACKER)),
  handle(req, res, url, ctx) {
    if (url.pathname.startsWith(ATTACKER)) return attacker(API, req, res, url, ctx.run);
    if (url.pathname === `${API}login` && req.method === 'POST') {
      const session = randomBytes(16).toString('base64url');
      const token = randomBytes(16).toString('base64url');
      sessions.set(session, token);
      return sendJson(res, 200, {}, {
        'set-cookie': [`m33-ex3a=${session}; HttpOnly; SameSite=Lax; Path=/`, `XSRF-TOKEN=${token}; SameSite=Lax; Path=/`],
      });
    }
    transferApi(API, req, res, url, ctx, check);
  },
};
