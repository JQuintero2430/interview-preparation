// @ts-check
// Fixture server for module 37 (HOUSE-38): serves the three builds of the `elements-lab` project. Node built-ins only; prints nothing.
//  - `/`            the v1 build (dist/elements-lab/browser/), or the v2 build (dist/elements-lab-v2/browser/) when the cookie `m37-deploy=v2` is set; SPA fallback to its index.html
//  - `/widgets/*`   the custom-element bundle (dist/elements-lab-widgets/browser/), no fallback
//  - `/host/*`      plain HTML host pages from ./elements-host/
//  - `/api/m37/*`   JSON endpoints with per-path request counters (`GET /api/m37/hits`, `POST /api/m37/reset`)
// `ngsw.json` and `ngsw-worker.js` are sent with `Cache-Control: no-cache`. The cookie `m37-net=down` destroys the socket of every request.
// A missing build folder answers 500 with a message naming the build command.
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../../angular/dist/', import.meta.url));
const V1 = join(DIST, 'elements-lab', 'browser') + sep;
const V2 = join(DIST, 'elements-lab-v2', 'browser') + sep;
const WIDGETS = join(DIST, 'elements-lab-widgets', 'browser') + sep;
const HOST = fileURLToPath(new URL('./elements-host/', import.meta.url));
const PORT = Number(process.env['PORT'] ?? 4900);
/** @type {Record<string, string>} */
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};
const NO_CACHE = new Set(['/ngsw.json', '/ngsw-worker.js']);
const API = ['catalog', 'prices', 'uncached'];
/** @type {Record<string, number>} */
const counters = Object.fromEntries(API.map((name) => [name, 0]));

/** @param {import('node:http').ServerResponse} res @param {number} status @param {string | Buffer} body @param {string} type @param {Record<string, string>} [extra] */
function send(res, status, body, type, extra = {}) {
  res.writeHead(status, { 'content-type': type, ...extra }).end(body);
}

/** @param {import('node:http').IncomingMessage} req @param {string} name */
function cookie(req, name) {
  const pair = (req.headers.cookie ?? '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return pair?.slice(name.length + 1);
}

/**
 * @param {import('node:http').ServerResponse} res
 * @param {string} root Folder to serve from, ending with a separator.
 * @param {string} path Path inside the folder.
 * @param {boolean} fallback Whether an extensionless miss answers the folder's index.html.
 * @param {string} missing Message for a missing folder.
 */
async function serve(res, root, path, fallback, missing) {
  try {
    await stat(root);
  } catch {
    return send(res, 500, missing, TYPES['.txt']);
  }
  const file = normalize(join(root, path));
  let served = file;
  /** @type {Buffer} */
  let content;
  try {
    if (!file.startsWith(root) || file.endsWith(sep)) throw new Error('fallback');
    content = await readFile(file);
  } catch {
    if (!fallback || extname(path)) return send(res, 404, `no file ${path}`, TYPES['.txt']);
    served = join(root, 'index.html');
    try {
      content = await readFile(served);
    } catch {
      return send(res, 500, missing, TYPES['.txt']);
    }
  }
  const cache = NO_CACHE.has(`/${path.replace(/^\//, '')}`) && root !== HOST ? { 'cache-control': 'no-cache' } : {};
  send(res, 200, content, TYPES[extname(served)] ?? 'application/octet-stream', cache);
}

/** @param {import('node:http').IncomingMessage} req @param {import('node:http').ServerResponse} res @param {string} path */
function api(req, res, path) {
  const json = 'application/json; charset=utf-8';
  const name = path.slice('/api/m37/'.length);
  if (name === 'hits' && req.method === 'GET') return send(res, 200, JSON.stringify(counters), json);
  if (name === 'reset' && req.method === 'POST') {
    for (const key of API) counters[key] = 0;
    return send(res, 200, JSON.stringify(counters), json);
  }
  if (!API.includes(name) || req.method !== 'GET') return send(res, 404, `no endpoint ${path}`, TYPES['.txt']);
  counters[name] = (counters[name] ?? 0) + 1;
  const body = { name, hit: counters[name], items: ['a', 'b', 'c'] };
  return send(res, 200, JSON.stringify(body), json, { 'cache-control': 'no-store' });
}

createServer(async (req, res) => {
  if (cookie(req, 'm37-net') === 'down') return void req.socket.destroy();
  try {
    const path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    if (path.startsWith('/api/m37/')) return api(req, res, path);
    if (path.startsWith('/widgets/')) {
      return await serve(res, WIDGETS, path.slice('/widgets/'.length), false, `Missing build in ${WIDGETS}. Run "npx ng build elements-lab --configuration elements" in labs/angular.`);
    }
    if (path.startsWith('/host/')) return await serve(res, HOST, path.slice('/host/'.length), false, `Missing folder ${HOST}.`);
    const v2 = cookie(req, 'm37-deploy') === 'v2';
    const root = v2 ? V2 : V1;
    const command = v2 ? 'npx ng build elements-lab --configuration v2' : 'npx ng build elements-lab';
    await serve(res, root, path, true, `Missing build in ${root}. Run "${command}" in labs/angular.`);
  } catch {
    if (!res.headersSent) send(res, 400, 'malformed request', TYPES['.txt']);
  }
}).listen(PORT);
