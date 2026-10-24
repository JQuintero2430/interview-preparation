// Section 3 claims, about our model (nginx-model.ts) and the committed deploy/nginx/default.conf.template read as text:
// the location precedence order, the SPA fallback next to a real 404 for hashed files, add_header inheritance with and
// without always, gzip_static's choice and Vary, and Brotli against gzip with node:zlib. Nginx is never run here.
import {
  headerValues,
  normalizeUri,
  readServer,
  respond,
  selectLocation,
  siteFiles,
  describeLocation,
  type StaticResponse,
} from './nginx-model';

// A variable specifier keeps node:fs and node:zlib out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const zlibSpecifier = 'node:zlib';
const fs: {
  readFileSync(path: URL, encoding: 'utf8'): string;
  readFileSync(path: URL): Uint8Array;
} = await import(fsSpecifier);
const zlib: {
  gzipSync(input: Uint8Array, options: { level: number }): Uint8Array;
  brotliCompressSync(input: Uint8Array, options: { params: Record<number, number> }): Uint8Array;
  constants: { BROTLI_PARAM_QUALITY: number };
} = await import(zlibSpecifier);

const committed = readServer(
  fs.readFileSync(new URL('../../../../../angular/deploy/nginx/default.conf.template', import.meta.url), 'utf8'),
);
const files = siteFiles(committed, ['index.html', 'main-NEWHASH1.js', 'main-NEWHASH1.js.gz', 'favicon.ico']);
const SECURITY_HEADERS = ['X-Content-Type-Options', 'Content-Security-Policy'];
/** Explicit levels, so the comparison never depends on a library default. */
const BROTLI_QUALITY = 11;
const GZIP_LEVEL = 9;

const cacheControl = (response: StaticResponse): readonly string[] => headerValues(response, 'Cache-Control');
const hasSecurityHeaders = (response: StaticResponse): boolean =>
  SECURITY_HEADERS.every((name) => headerValues(response, name).length === 1);

describe('Module 44 · section 3', () => {
  it('Section 3: an exact location wins, then a ^~ prefix, then the first matching regex, then the longest prefix', () => {
    // nginx.org's own example for the location directive (configurations A to E), plus a second regex after E.
    const server = readServer(`server {
      location = / { }
      location / { }
      location /documents/ { }
      location ^~ /images/ { }
      location ~* \\.(gif|jpg|jpeg)$ { }
      location ~ \\.jpg$ { }
    }`);
    const pick = (uri: string): string => describeLocation(selectLocation(server, normalizeUri(uri)));
    expect(pick('/')).toBe('= /');
    expect(pick('/images/1.gif')).toBe('^~ /images/');
    expect(pick('/documents/1.jpg')).toBe('~* \\.(gif|jpg|jpeg)$');
    expect(pick('/documents/document.html')).toBe('/documents/');
    expect(pick('/index.html')).toBe('/');
    // Matching runs on the normalized URI: "..", "." and doubled slashes are resolved first.
    expect(pick('/documents/../images//./1.gif')).toBe('^~ /images/');
  });

  it('Section 3: on the committed config a route gets index.html with no-cache and a missing hashed file gets 404', () => {
    const route = respond(committed, { uri: '/orders/42' }, files);
    expect(route.status).toBe(200);
    expect(route.file).toBe('/usr/share/nginx/html/index.html');
    // try_files ends in an internal redirect to /index.html, which is matched again by the exact location.
    expect(describeLocation(route.location)).toBe('= /index.html');
    expect(cacheControl(route)).toEqual(['no-cache']);

    const current = respond(committed, { uri: '/main-NEWHASH1.js' }, files);
    expect(current.status).toBe(200);
    expect(cacheControl(current)).toEqual(['public, max-age=31536000, immutable']);

    const deleted = respond(committed, { uri: '/main-OLDHASH1.js' }, files);
    expect(deleted.status).toBe(404);
    expect(deleted.file).toBeUndefined();

    const unhashed = respond(committed, { uri: '/favicon.ico' }, files);
    expect(describeLocation(unhashed.location)).toBe('/');
    expect(cacheControl(unhashed)).toEqual(['no-cache']);
  });

  it('Section 3: a location with its own add_header loses the server-level headers', () => {
    const config = (inherit: string): string => `server {
      root /site;
      ${inherit}
      add_header X-Content-Type-Options "nosniff" always;
      location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
      location / { }
    }`;
    const plain = readServer(config(''));
    const site = siteFiles(plain, ['index.html', 'assets/app.js']);
    expect(headerValues(respond(plain, { uri: '/assets/app.js' }, site), 'X-Content-Type-Options')).toEqual([]);
    // A location without add_header of its own inherits the server's.
    expect(headerValues(respond(plain, { uri: '/index.html' }, site), 'X-Content-Type-Options')).toEqual(['nosniff']);
    // add_header_inherit merge (nginx 1.29.3+) appends the server's headers after the location's own.
    const merged = respond(readServer(config('add_header_inherit merge;')), { uri: '/assets/app.js' }, site);
    expect(merged.headers.map((header) => header.name)).toEqual(['Cache-Control', 'X-Content-Type-Options']);
  });

  it('Section 3: with always, a 404 still carries the security headers', () => {
    const deleted = respond(committed, { uri: '/main-OLDHASH1.js' }, files);
    expect(deleted.status).toBe(404);
    expect(hasSecurityHeaders(deleted)).toBe(true);
    // The location's Cache-Control has no always, so the 404 goes out without it.
    expect(cacheControl(deleted)).toEqual([]);

    const withoutAlways = readServer(`server { add_header X-Content-Type-Options "nosniff"; location / { try_files $uri =404; } }`);
    expect(respond(withoutAlways, { uri: '/missing.js' }, new Set()).headers).toEqual([]);
  });

  it('Section 3: gzip_static serves the .gz file with Vary when the client accepts gzip and the original otherwise', () => {
    const accepting = respond(committed, { uri: '/main-NEWHASH1.js', acceptEncoding: 'gzip, deflate, br' }, files);
    expect(accepting.file).toBe('/usr/share/nginx/html/main-NEWHASH1.js.gz');
    expect(headerValues(accepting, 'Content-Encoding')).toEqual(['gzip']);
    expect(headerValues(accepting, 'Vary')).toEqual(['Accept-Encoding']);

    const refusing = respond(committed, { uri: '/main-NEWHASH1.js', acceptEncoding: 'gzip;q=0' }, files);
    expect(refusing.file).toBe('/usr/share/nginx/html/main-NEWHASH1.js');
    expect(headerValues(refusing, 'Content-Encoding')).toEqual([]);
    // With gzip_vary on, Vary goes out whenever the .gz file exists, so a cache never serves one copy to both.
    expect(headerValues(refusing, 'Vary')).toEqual(['Accept-Encoding']);
    expect(respond(committed, { uri: '/main-NEWHASH1.js' }, files).file).toBe('/usr/share/nginx/html/main-NEWHASH1.js');
  });

  it('Section 3: Brotli at quality 11 is smaller than gzip at level 9 on a committed source file', () => {
    // Committed input (this folder's model), so the result does not move with a dependency's version.
    const input = fs.readFileSync(new URL('./nginx-model.ts', import.meta.url));
    const gzip = zlib.gzipSync(input, { level: GZIP_LEVEL });
    const brotli = zlib.brotliCompressSync(input, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY } });
    expect(brotli.length).toBeLessThan(gzip.length);
  });
});
