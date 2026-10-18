// @ts-check
// Fixture server for module 34 (HOUSE-31): serves the per-locale builds of the `i18n-lab` project. Node built-ins only; prints nothing.
// - `/en-US/…`, `/fr/…`, `/ar/…` from labs/angular/dist/i18n-lab/browser/<locale>/, each with an SPA fallback to that locale's index.html.
// - `/runtime/…` from dist/i18n-lab-runtime/browser/ with its own SPA fallback.
// - `/` answers 302 to `/<locale>/`, chosen from `Accept-Language` (exact tag, then language subtag, among en-US, fr, ar; default en-US),
//   with `Vary: Accept-Language`. This is the lab's own logic, modelled on the Angular docs' Nginx example, not an `@angular/ssr` feature.
// - A missing build folder answers 500 with a message naming the build command.
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = new URL('../../angular/dist/', import.meta.url);
const LOCALES = ['en-US', 'fr', 'ar'];
const PORT = Number(process.env['PORT'] ?? 4600);
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

/** @param {string} header @returns {string} The locale folder for an `Accept-Language` header value. */
function pickLocale(header) {
  const tags = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.map((param) => /^\s*q=([\d.]+)\s*$/.exec(param)?.[1]).find((value) => value !== undefined);
      return { tag: tag.trim().toLowerCase(), q: q === undefined ? 1 : Number(q) };
    })
    .filter((entry) => entry.tag && entry.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of tags) {
    const exact = LOCALES.find((locale) => locale.toLowerCase() === tag);
    if (exact) return exact;
    const byLanguage = LOCALES.find((locale) => locale.toLowerCase().split('-')[0] === tag.split('-')[0]);
    if (byLanguage) return byLanguage;
  }
  return 'en-US';
}

/** @param {import('node:http').ServerResponse} res @param {number} status @param {string | Buffer} body @param {string} type */
function send(res, status, body, type) {
  res.writeHead(status, { 'content-type': type }).end(body);
}

/** @param {string} root */
function missingBuild(root) {
  return `Missing build in ${root}. Run "npx ng build i18n-lab" and "npx ng build i18n-lab -c production,runtime" in labs/angular.`;
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
    const url = new URL(req.url ?? '/', 'http://localhost');
    const path = decodeURIComponent(url.pathname);
    if (path === '/') {
      res.setHeader('vary', 'Accept-Language');
      res.writeHead(302, { location: `/${pickLocale(String(req.headers['accept-language'] ?? ''))}/` }).end();
      return;
    }
    const [, first = '', ...rest] = path.split('/');
    const inner = `/${rest.join('/')}`;
    if (first === 'runtime') return await serve(res, fileURLToPath(new URL('i18n-lab-runtime/browser/', DIST)), inner);
    if (LOCALES.includes(first)) return await serve(res, fileURLToPath(new URL(`i18n-lab/browser/${first}/`, DIST)), inner);
    send(res, 404, `no route ${path}`, TYPES['.txt']);
  } catch {
    if (!res.headersSent) send(res, 400, 'malformed request', TYPES['.txt']);
  }
}).listen(PORT);
