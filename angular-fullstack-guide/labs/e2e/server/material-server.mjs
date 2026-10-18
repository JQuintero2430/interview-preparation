// @ts-check
// Fixture server for module 36 (HOUSE-35): serves the production build of the `material-lab` project. Node built-ins only; prints nothing.
// Everything comes from labs/angular/dist/material-lab/browser/ with an SPA fallback to its index.html;
// a missing build folder answers 500 with a message naming the build command.
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../angular/dist/material-lab/browser/', import.meta.url));
const PORT = Number(process.env['PORT'] ?? 4800);
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
const MISSING = `Missing build in ${ROOT}. Run "npx ng build material-lab" in labs/angular.`;

/** @param {import('node:http').ServerResponse} res @param {number} status @param {string | Buffer} body @param {string} type */
function send(res, status, body, type) {
  res.writeHead(status, { 'content-type': type }).end(body);
}

/** @param {import('node:http').ServerResponse} res @param {string} path Path inside the build folder. */
async function serve(res, path) {
  try {
    await stat(ROOT);
  } catch {
    return send(res, 500, MISSING, TYPES['.txt']);
  }
  const file = normalize(join(ROOT, path));
  let served = file;
  /** @type {Buffer} */
  let content;
  try {
    if (!file.startsWith(ROOT) || file.endsWith(sep)) throw new Error('fallback');
    content = await readFile(file);
  } catch {
    if (extname(path)) return send(res, 404, `no file ${path}`, TYPES['.txt']);
    served = join(ROOT, 'index.html');
    try {
      content = await readFile(served);
    } catch {
      return send(res, 500, MISSING, TYPES['.txt']);
    }
  }
  send(res, 200, content, TYPES[extname(served)] ?? 'application/octet-stream');
}

createServer(async (req, res) => {
  try {
    await serve(res, decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname));
  } catch {
    if (!res.headersSent) send(res, 400, 'malformed request', TYPES['.txt']);
  }
}).listen(PORT);
