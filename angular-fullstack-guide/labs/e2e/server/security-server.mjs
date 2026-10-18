// @ts-check
// Fixture server for module 33 (HOUSE-29): serves the two production builds of the `security-lab` project
// and the route modules of `server/security/*.mjs`. Node built-ins only; prints nothing.
// - `/…` from labs/angular/dist/security-lab/browser/, `/autocsp/…` from dist/security-lab-autocsp/browser/;
//   `/`, `/m33/…`, `/autocsp/` and `/autocsp/m33/…` fall back to that build's index.html.
// - Every HTML response gets a fresh 16-byte base64 nonce in place of `__CSP_NONCE__`, and `Cache-Control: no-store`.
//   The server sends no CSP of its own: a route module's `headers(ctx)` adds one.
// - Listens on all interfaces, so `localhost:4500` and `127.0.0.1:4500` are two sites for the browser.
// - Server state (CSP reports and `ctx.log` entries) is keyed by the run id: the `?run=` query parameter when present,
//   else the `m33-run` cookie, else `public`.
import { randomBytes } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * @typedef {{ nonce: string, run: string, log: (entry: unknown) => void }} RouteContext
 * @typedef {object} RouteModule
 * @property {string} name
 * @property {(url: URL, host: string) => boolean} match `host` is the request's host name (`localhost` or `127.0.0.1`).
 * @property {(ctx: RouteContext) => Record<string, string>} [headers] Extra response headers, applied before `handle` or the static file.
 * @property {(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse, url: URL, ctx: RouteContext) => unknown} [handle]
 *   Answers the request itself; without it the request goes on to the static files.
 * @typedef {{ reports: unknown[], requests: unknown[] }} RunLog
 */

const DIST = new URL('../../angular/dist/', import.meta.url);
const BUILDS = {
  nonce: fileURLToPath(new URL('security-lab/browser/', DIST)),
  autocsp: fileURLToPath(new URL('security-lab-autocsp/browser/', DIST)),
};
const MODULES_DIR = new URL('./security/', import.meta.url);
const PORT = Number(process.env['PORT'] ?? 4500);
const MAX_BODY = 1_000_000;
const NONCE_PLACEHOLDER = /__CSP_NONCE__/g;
/** @type {Record<string, string>} */
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};
const REPORT_TYPES = ['application/csp-report', 'application/reports+json'];

/** @type {Map<string, RunLog>} */
const runs = new Map();

/** @param {string} run */
function runLog(run) {
  let log = runs.get(run);
  if (!log) runs.set(run, (log = { reports: [], requests: [] }));
  return log;
}

/** @param {import('node:http').IncomingMessage} req @param {URL} url */
function runOf(req, url) {
  const cookie = /(?:^|;\s*)m33-run=([^;]+)/.exec(req.headers.cookie ?? '');
  return url.searchParams.get('run') ?? (cookie ? decodeURIComponent(cookie[1]) : 'public');
}

/** @param {import('node:http').ServerResponse} res @param {number} status @param {unknown} [body] @param {string} [type] */
function send(res, status, body, type = 'application/json') {
  if (body === undefined) return res.writeHead(status).end();
  res.writeHead(status, { 'content-type': type }).end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

/** @param {import('node:http').IncomingMessage} req */
async function readBody(req) {
  /** @type {Buffer[]} */
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.byteLength;
    if (size > MAX_BODY) throw new Error('Body too large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

/** @returns {Promise<RouteModule[]>} */
async function loadModules() {
  /** @type {string[]} */
  let files;
  try {
    files = (await readdir(MODULES_DIR)).filter((file) => file.endsWith('.mjs')).sort();
  } catch {
    return []; // No folder means no route modules.
  }
  /** @type {RouteModule[]} */
  const modules = [];
  for (const file of files) {
    const loaded = await import(pathToFileURL(fileURLToPath(new URL(file, MODULES_DIR))).href);
    const module = loaded.default ?? loaded;
    if (typeof module.name !== 'string' || typeof module.match !== 'function') throw new Error(`server/security/${file}: needs name and match`);
    modules.push(module);
  }
  return modules;
}

/**
 * Built-ins: `POST /__csp-report`, `GET /__log`, `POST /__reset` (each with `?run=<id>`).
 * @param {import('node:http').IncomingMessage} req @param {import('node:http').ServerResponse} res @param {URL} url @param {string} run
 */
async function builtIn(req, res, url, run) {
  if (url.pathname === '/__csp-report' && req.method === 'POST') {
    const type = (req.headers['content-type'] ?? '').split(';')[0].trim();
    if (!REPORT_TYPES.includes(type)) return send(res, 415, { error: `unsupported content type ${type}` });
    const body = JSON.parse((await readBody(req)) || 'null');
    const reports = type === 'application/csp-report' ? [body?.['csp-report']] : Array.isArray(body) ? body.map((item) => item?.body) : [];
    runLog(run).reports.push(...reports.map((report) => ({ contentType: type, report })));
    return send(res, 204);
  }
  if (url.pathname === '/__log' && req.method === 'GET') return send(res, 200, runLog(run));
  if (url.pathname === '/__reset' && req.method === 'POST') return runs.delete(run), send(res, 204);
  send(res, 404, { error: `no built-in ${req.method} ${url.pathname}` });
}

/** @param {import('node:http').ServerResponse} res @param {URL} url @param {string} nonce */
async function staticFile(res, url, nonce) {
  const autocsp = url.pathname === '/autocsp' || url.pathname.startsWith('/autocsp/');
  const root = autocsp ? BUILDS.autocsp : BUILDS.nonce;
  const path = autocsp ? url.pathname.slice('/autocsp'.length) || '/' : url.pathname;
  const file = normalize(join(root, decodeURIComponent(path)));
  const inRoot = file.startsWith(root) && !file.endsWith(sep);
  const isAppRoute = path === '/' || /^\/m33(\/|$)/.test(path);
  let served = file;
  /** @type {Buffer} */
  let content;
  try {
    if (!inRoot) throw new Error('fallback');
    content = await readFile(file);
  } catch {
    if (!isAppRoute) return send(res, 404, { error: `no file ${url.pathname}` });
    served = join(root, 'index.html');
    content = await readFile(served);
  }
  if (extname(served) !== '.html') return send(res, 200, content, TYPES[extname(served)] ?? 'application/octet-stream');
  res.setHeader('cache-control', 'no-store');
  send(res, 200, content.toString('utf8').replace(NONCE_PLACEHOLDER, nonce), TYPES['.html']);
}

const modules = await loadModules();

createServer(async (req, res) => {
  try {
    // Parsed inside the try: a malformed cookie or path answers 400 instead of crashing the server.
    const host = (req.headers.host ?? 'localhost').replace(/:\d+$/, '');
    const url = new URL(req.url ?? '/', 'http://localhost');
    const run = runOf(req, url);
    if (url.pathname.startsWith('/__')) return await builtIn(req, res, url, run);
    /** @type {RouteContext} */
    const ctx = { nonce: randomBytes(16).toString('base64'), run, log: (entry) => void runLog(run).requests.push(entry) };
    const matched = modules.filter((module) => module.match(url, host));
    for (const module of matched) for (const [name, value] of Object.entries(module.headers?.(ctx) ?? {})) res.setHeader(name, value);
    const handler = matched.find((module) => module.handle);
    if (handler?.handle) return await handler.handle(req, res, url, ctx);
    await staticFile(res, url, ctx.nonce);
  } catch {
    if (!res.headersSent) send(res, 400, { error: 'malformed request' });
  }
}).listen(PORT);
