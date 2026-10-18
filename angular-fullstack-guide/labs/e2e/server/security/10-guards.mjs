// @ts-check
// Section 10 (SEC-M33-10): an admin API that decides from the session, never from the page. Node built-ins only.
// - `POST /api/m33/guards/login?role=user|admin` stores the role server-side and sets `m33-guards=<id>; HttpOnly`.
// - `GET /api/m33/guards/report` answers 401 without a session, 403 for a `user` and 200 for an `admin`; every call is
//   logged with the status. The page's copy of the role in `localStorage` never reaches this module.
import { randomBytes } from 'node:crypto';

const PREFIX = '/api/m33/guards/';
/** Session id to its role (a lab: nothing expires). */
const sessions = new Map();

/**
 * @param {import('node:http').ServerResponse} res @param {number} status @param {unknown} body
 * @param {Record<string, string>} [headers]
 */
function sendJson(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json', ...headers }).end(JSON.stringify(body));
}

/** @param {import('node:http').IncomingMessage} req */
function sessionRole(req) {
  const pair = (req.headers.cookie ?? '').split(/;\s*/).find((candidate) => candidate.startsWith('m33-guards='));
  return pair === undefined ? undefined : sessions.get(pair.slice('m33-guards='.length));
}

/** @type {import('../security-server.mjs').RouteModule} */
export default {
  name: '10-guards',
  match: (url) => url.pathname.startsWith(PREFIX),
  handle(req, res, url, ctx) {
    if (url.pathname === `${PREFIX}login` && req.method === 'POST') {
      const role = url.searchParams.get('role') === 'admin' ? 'admin' : 'user';
      const id = randomBytes(16).toString('base64url');
      sessions.set(id, role);
      return sendJson(res, 200, { role }, { 'set-cookie': `m33-guards=${id}; HttpOnly; SameSite=Lax; Path=/` });
    }
    if (url.pathname === `${PREFIX}report` && req.method === 'GET') {
      const role = sessionRole(req);
      const status = role === undefined ? 401 : role === 'admin' ? 200 : 403;
      ctx.log({ report: true, role: role ?? null, status });
      return sendJson(res, status, status === 200 ? { rows: 3 } : { error: status === 401 ? 'sign in' : 'admins only' });
    }
    sendJson(res, 404, { error: `no ${req.method} ${url.pathname}` });
  },
};
