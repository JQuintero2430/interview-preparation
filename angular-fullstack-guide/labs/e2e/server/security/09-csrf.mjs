// @ts-check
// Section 9 (SEC-M33-09): a cookie-session API and two attacker pages. Node built-ins only.
// - `POST /api/m33/csrf/login` sets four HttpOnly session cookies (`lax`, `strict`, `none`, `def`, one per SameSite
//   choice; `none` is `SameSite=None; Secure`, `def` has no SameSite attribute) and the readable `XSRF-TOKEN`.
// - `POST /api/m33/csrf/transfer` needs a session cookie (else 401) and an `X-XSRF-TOKEN` header equal to that
//   session's token (else 403). Every call is logged with what arrived: cookie names, `Sec-Fetch-Site`, `Origin`.
// - `GET /api/m33/csrf/xssi` answers `)]}',` and a newline before the JSON.
// - `/m33/csrf/attacker/form` and `/m33/csrf/attacker/fetch` are served only on host `127.0.0.1` (another site than
//   `localhost`): the first auto-submits a form POST to the app's site, the second sends a no-cors fetch with credentials.
import { randomBytes } from 'node:crypto';

const PREFIX = '/api/m33/csrf/';
const ATTACKER = '/m33/csrf/attacker/';
const SESSION_COOKIES = ['lax', 'strict', 'none', 'def'];
/** Session id to its XSRF token (a lab: nothing expires). */
const sessions = new Map();

/**
 * @param {import('node:http').ServerResponse} res @param {number} status @param {unknown} body
 * @param {Record<string, string | string[]>} [headers]
 */
function sendJson(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json', ...headers }).end(JSON.stringify(body));
}

/** @param {import('node:http').IncomingMessage} req @returns {Map<string, string>} */
function cookiesOf(req) {
  const pairs = (req.headers.cookie ?? '').split(/;\s*/).filter(Boolean);
  return new Map(pairs.map((pair) => [pair.slice(0, pair.indexOf('=')), pair.slice(pair.indexOf('=') + 1)]));
}

/** @param {string | string[] | undefined} value */
function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

/** The HTML of an attacker page: `body` is its markup, `script` runs at once. @param {string} body @param {string} script */
function attackerPage(body, script) {
  return `<!doctype html><meta charset="utf-8"><title>Prize</title><p>You won a prize.</p>${body}<script>${script}</script>`;
}

/** @param {import('node:http').IncomingMessage} req @param {import('node:http').ServerResponse} res @param {URL} url @param {import('../security-server.mjs').RouteContext} ctx */
function attacker(req, res, url, ctx) {
  const port = (req.headers.host ?? '').split(':')[1] ?? '4500';
  const target = `http://localhost:${port}${PREFIX}transfer?run=${encodeURIComponent(ctx.run)}`;
  const html =
    url.pathname === `${ATTACKER}form`
      ? attackerPage(`<form method="post" action="${target}"><input type="hidden" name="amount" value="1000"></form>`, 'document.forms[0].submit()')
      : attackerPage('', `fetch(${JSON.stringify(target)}, { method: 'POST', credentials: 'include', mode: 'no-cors', headers: { 'content-type': 'text/plain' }, body: 'amount=1000' })`);
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }).end(html);
}

/** @type {import('../security-server.mjs').RouteModule} */
export default {
  name: '09-csrf',
  match: (url, host) => url.pathname.startsWith(PREFIX) || (host === '127.0.0.1' && url.pathname.startsWith(ATTACKER)),
  handle(req, res, url, ctx) {
    if (url.pathname.startsWith(ATTACKER)) return attacker(req, res, url, ctx);
    if (url.pathname === `${PREFIX}login` && req.method === 'POST') {
      const session = randomBytes(16).toString('base64url');
      const token = randomBytes(16).toString('base64url');
      sessions.set(session, token);
      return sendJson(res, 200, {}, {
        'set-cookie': [
          `lax=${session}; HttpOnly; SameSite=Lax; Path=/`,
          `strict=${session}; HttpOnly; SameSite=Strict; Path=/`,
          `none=${session}; HttpOnly; SameSite=None; Secure; Path=/`,
          `def=${session}; HttpOnly; Path=/`,
          // Readable by script (no HttpOnly), as the cookie-to-header pattern needs; Lax, so a cross-site POST leaves it behind.
          `XSRF-TOKEN=${token}; SameSite=Lax; Path=/`,
        ],
      });
    }
    if (url.pathname === `${PREFIX}transfer` && req.method === 'POST') {
      req.resume();
      const cookies = cookiesOf(req);
      const session = SESSION_COOKIES.map((name) => cookies.get(name)).find((value) => value !== undefined && sessions.has(value));
      const header = first(req.headers['x-xsrf-token']);
      const status = session === undefined ? 401 : header !== undefined && header === sessions.get(session) ? 200 : 403;
      ctx.log({
        transfer: true,
        cookies: [...cookies.keys()].filter((name) => name !== 'm33-run').sort(),
        secFetchSite: first(req.headers['sec-fetch-site']) ?? null,
        origin: first(req.headers.origin) ?? null,
        header: header !== undefined,
        status,
      });
      return sendJson(res, status, status === 200 ? { ok: true } : { error: status === 401 ? 'sign in' : 'missing or wrong X-XSRF-TOKEN' });
    }
    if (url.pathname === `${PREFIX}xssi` && req.method === 'GET') {
      return void res.writeHead(200, { 'content-type': 'application/json' }).end(")]}',\n" + JSON.stringify({ ok: true }));
    }
    sendJson(res, 404, { error: `no ${req.method} ${url.pathname}` });
  },
};
