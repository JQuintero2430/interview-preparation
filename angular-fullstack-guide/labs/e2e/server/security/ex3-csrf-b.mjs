// @ts-check
// Exercise 33.3 (EX-M33-03), the alternative: the same transfer API behind a `SameSite=Strict` session cookie and a
// check of `Sec-Fetch-Site` and `Origin`, with no token. Node built-ins only. Under `/api/m33/ex3/b/`:
// - `POST login` sets the HttpOnly session cookie (`SameSite=Strict`), new at every login.
// - `POST transfer` needs the session (else 401), `Sec-Fetch-Site` `same-origin` or `none`, and an `Origin` equal to
//   the app's own (else 403). `GET transfer` answers 405; `GET account` answers how many transfers the run applied.
// `/m33/ex3/b/attacker/form` and `/fetch` are the attacker pages of `ex3-csrf-a.mjs`, aimed at this API.
import { randomBytes } from 'node:crypto';
import { attacker, cookiesOf, first, sendJson, transferApi } from './ex3-csrf-a.mjs';

const API = '/api/m33/ex3/b/';
const ATTACKER = '/m33/ex3/b/attacker/';
const sessions = new Set();

/** The alternative's decision: a session, then the browser's own metadata. @param {import('node:http').IncomingMessage} req */
function check(req) {
  const session = cookiesOf(req).get('m33-ex3b');
  if (session === undefined || !sessions.has(session)) return 401;
  const site = first(req.headers['sec-fetch-site']);
  const sameSite = site === 'same-origin' || site === 'none';
  return sameSite && first(req.headers.origin) === `http://${req.headers.host}` ? 200 : 403;
}

/** @type {import('../security-server.mjs').RouteModule} */
export default {
  name: 'ex3-csrf-b',
  match: (url, host) => url.pathname.startsWith(API) || (host === '127.0.0.1' && url.pathname.startsWith(ATTACKER)),
  handle(req, res, url, ctx) {
    if (url.pathname.startsWith(ATTACKER)) return attacker(API, req, res, url, ctx.run);
    if (url.pathname === `${API}login` && req.method === 'POST') {
      const session = randomBytes(16).toString('base64url');
      sessions.add(session);
      return sendJson(res, 200, {}, { 'set-cookie': `m33-ex3b=${session}; HttpOnly; SameSite=Strict; Path=/` });
    }
    transferApi(API, req, res, url, ctx, check);
  },
};
