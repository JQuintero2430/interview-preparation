// @ts-check
// Fixture server for module 35 (HOUSE-33): serves the two builds of the `animations-lab` project. Node built-ins only; prints nothing.
// - `/legacy/…` from labs/angular/dist/animations-lab-legacy/browser/ with an SPA fallback to its index.html.
// - everything else from dist/animations-lab/browser/ with its own SPA fallback.
// - A missing build folder answers 500 with a message naming the build command.
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = new URL('../../angular/dist/', import.meta.url);
const LEGACY_PREFIX = '/legacy';
const PORT = Number(process.env['PORT'] ?? 4700);
/** @type {Record<string, string>} */
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

/** @param {import('node:http').ServerResponse} res @param {number} status @param {string | Buffer} body @param {string} type */
function send(res, status, body, type) {
  res.writeHead(status, { 'content-type': type }).end(body);
}

/** @param {string} root */
function missingBuild(root) {
  return `Missing build in ${root}. Run "npx ng build animations-lab" and "npx ng build animations-lab -c production,legacy" in labs/angular.`;
}

/** @param {import('node:http').ServerResponse} res @param {string} root @param {string} path Path inside the build folder. */
async function serve(res, root, path) {
  try {
    await stat(root);
  } catch {
    return send(res, 500, missingBuild(root), TYPES['.txt']);
  }
  const file = normalize(join(root, path));
  let served = file;
  /** @type {Buffer} */
  let content;
  try {
    if (!file.startsWith(root) || file.endsWith(sep)) throw new Error('fallback');
    content = await readFile(file);
  } catch {
    if (extname(path)) return send(res, 404, `no file ${path}`, TYPES['.txt']);
    served = join(root, 'index.html');
    try {
      content = await readFile(served);
    } catch {
      return send(res, 500, missingBuild(root), TYPES['.txt']);
    }
  }
  send(res, 200, content, TYPES[extname(served)] ?? 'application/octet-stream');
}

createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    const isLegacy = path === LEGACY_PREFIX || path.startsWith(`${LEGACY_PREFIX}/`);
    if (isLegacy) return await serve(res, fileURLToPath(new URL('animations-lab-legacy/browser/', DIST)), path.slice(LEGACY_PREFIX.length) || '/');
    return await serve(res, fileURLToPath(new URL('animations-lab/browser/', DIST)), path);
  } catch {
    if (!res.headersSent) send(res, 400, 'malformed request', TYPES['.txt']);
  }
}).listen(PORT);
