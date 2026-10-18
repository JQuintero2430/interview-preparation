// @ts-check
// Exercise 33.4 (EX-M33-04), the alternative: a backend-for-frontend. The browser holds only an `HttpOnly;
// SameSite=Strict` session cookie; this server keeps the access token and calls the bearer API of `ex4-tokens-a.mjs`
// (`GET /api/m33/ex4/a/data`) for it. Node built-ins only. Under `/api/m33/ex4/b/`:
// - `POST login` mints an access token, keeps it under a new session id and sets the session cookie.
// - `GET session` answers 204 for a valid session (else 401); `DELETE session` revokes the session and its token and
//   clears the cookie (204).
// - `GET data` needs the session (else 401) and forwards to the bearer API with the token, answering what the API answered.
// `/m33/ex4/b/attacker` is the attacker page of `ex4-tokens-a.mjs`, aimed at this API.
import { randomBytes } from 'node:crypto';
import { attacker, cookiesOf, logRequest, mintAccessToken, revokeAccessToken, sendJson } from './ex4-tokens-a.mjs';

const API = '/api/m33/ex4/b/';
const UPSTREAM = '/api/m33/ex4/a/data';
const ATTACKER = '/m33/ex4/b/attacker';
const SESSION_COOKIE = 'm33-ex4b';
/** @type {Map<string, string>} Session id to the access token the server holds for it. */
const sessions = new Map();

/**
 * Calls the bearer API from the server, on the port this request came in on, under the same run id.
 * @param {import('node:http').IncomingMessage} req @param {string} token @param {string} run
 * @returns {Promise<{ status: number, body: unknown }>}
 */
async function upstream(req, token, run) {
  const url = `http://localhost:${req.socket.localPort}${UPSTREAM}?run=${encodeURIComponent(run)}`;
  const response = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  return { status: response.status, body: await response.json() };
}

/** @typedef {{ status: number, body?: unknown, headers?: Record<string, string> }} Answer */

/**
 * The decision for a route under `/api/m33/ex4/b/`.
 * @param {import('node:http').IncomingMessage} req @param {string} route @param {string} run @returns {Promise<Answer>}
 */
async function decide(req, route, run) {
  const session = cookiesOf(req).get(SESSION_COOKIE) ?? '';
  const token = sessions.get(session);
  const refused = { status: 401, body: { error: 'sign in' } };
  if (route === 'login' && req.method === 'POST') {
    const created = randomBytes(16).toString('base64url');
    sessions.set(created, mintAccessToken());
    return { status: 204, headers: { 'set-cookie': `${SESSION_COOKIE}=${created}; HttpOnly; SameSite=Strict; Path=/` } };
  }
  if (route === 'session' && req.method === 'GET') return token === undefined ? refused : { status: 204 };
  if (route === 'session' && req.method === 'DELETE') {
    if (token !== undefined) revokeAccessToken(token);
    sessions.delete(session);
    return { status: 204, headers: { 'set-cookie': `${SESSION_COOKIE}=; Max-Age=0; HttpOnly; SameSite=Strict; Path=/` } };
  }
  if (route === 'data' && req.method === 'GET') return token === undefined ? refused : upstream(req, token, run);
  return { status: 404, body: { error: `no ${req.method} ${route}` } };
}

/** @type {import('../security-server.mjs').RouteModule} */
export default {
  name: 'ex4-tokens-b',
  match: (url, host) => url.pathname.startsWith(API) || (host === '127.0.0.1' && url.pathname === ATTACKER),
  async handle(req, res, url, ctx) {
    if (url.pathname === ATTACKER) {
      const targets = [{ method: 'GET', path: `${API}session` }, { method: 'GET', path: `${API}data` }];
      return attacker(req, res, targets, ctx.run);
    }
    req.resume();
    const route = url.pathname.slice(API.length);
    const answer = await decide(req, route, ctx.run);
    logRequest('b', route, req, ctx, answer.status);
    sendJson(res, answer.status, answer.body, answer.headers);
  },
};
