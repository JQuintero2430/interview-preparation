// Output question Q44.05: five requests through our nginx-model.ts model, applied to the committed
// deploy/nginx/default.conf.template read as text (nginx.org's location order; Nginx itself is never run).
import {
  describeLocation,
  headerValues,
  readServer,
  respond,
  siteFiles,
} from '../../modules/44-fullstack-delivery-and-operations/concepts/nginx-model';
import { captureLogs } from '../capture';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const fs: { readFileSync(path: URL, encoding: 'utf8'): string } = await import(fsSpecifier);

describe('44 · Q44.05', () => {
  it('Q44.05 location, status and Cache-Control for five requests', async () => {
    const server = readServer(
      fs.readFileSync(new URL('../../../../angular/deploy/nginx/default.conf.template', import.meta.url), 'utf8'),
    );
    // The site's files, plus the config.json that the container's entrypoint writes and the location aliases.
    const files = new Set([
      ...siteFiles(server, ['index.html', 'main-NEWHASH1.js', 'favicon.ico']),
      '/tmp/app-config/config.json',
    ]);
    const lines = await captureLogs((log) => {
      for (const uri of ['/orders/42', '/main-OLDHASH1.js', '/favicon.ico', '/config.json', '/index.html']) {
        const response = respond(server, { uri }, files);
        const location = describeLocation(response.location);
        log(
          uri,
          '→',
          location.startsWith('~') ? 'hashed-file regex' : location,
          '→',
          response.status,
          headerValues(response, 'Cache-Control').join(' | ') || '(none)',
        );
      }
    });
    expect(lines).toEqual([
      '/orders/42 → = /index.html → 200 no-cache',
      '/main-OLDHASH1.js → hashed-file regex → 404 (none)',
      '/favicon.ico → / → 200 no-cache',
      '/config.json → = /config.json → 200 no-store',
      '/index.html → = /index.html → 200 no-cache',
    ]);
    // With `always`, the 404 for the deleted chunk still carries both security headers.
    const deleted = respond(server, { uri: '/main-OLDHASH1.js' }, files);
    expect(headerValues(deleted, 'X-Content-Type-Options')).toEqual(['nosniff']);
    expect(headerValues(deleted, 'Content-Security-Policy')).toEqual(["frame-ancestors 'self'"]);
  });
});
