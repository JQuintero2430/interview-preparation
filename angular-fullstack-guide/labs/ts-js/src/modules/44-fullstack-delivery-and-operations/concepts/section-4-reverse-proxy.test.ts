// Section 4 claims, about our model (proxy-model.ts, which reuses nginx-model.ts) and the committed
// deploy/nginx/default.conf.template read as text: the proxy_pass URI rule, the header fields the upstream receives,
// the read timeout over a timeline in seconds, and which forwarded headers an application may believe. Nginx and Spring
// Boot are never run here; the timeline is numbers the test passes.
import { readServer, selectLocation, normalizeUri, type Location, type Server } from './nginx-model';
import {
  closedAt,
  proxyTarget,
  readMaps,
  readTimeoutSeconds,
  resolveClient,
  upstreamHeaders,
  upstreamUri,
  type ProxyRequest,
} from './proxy-model';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const fs: { readFileSync(path: URL, encoding: 'utf8'): string } = await import(fsSpecifier);

const text = fs.readFileSync(new URL('../../../../../angular/deploy/nginx/default.conf.template', import.meta.url), 'utf8');
const committed = readServer(text);
const maps = readMaps(text);

function locationFor(server: Server, uri: string): Location {
  const location = selectLocation(server, normalizeUri(uri));
  if (!location) {
    throw new Error(`no location for ${uri}`);
  }
  return location;
}

const browser = (extra: Record<string, string> = {}): ProxyRequest => ({
  headers: { Host: 'app.example.com', Accept: 'application/json', ...extra },
  remoteAddr: '203.0.113.7',
  scheme: 'https',
});

describe('Module 44 · section 4', () => {
  it('Section 4: proxy_pass with a URI replaces the matched prefix and without one passes the request URI unchanged', () => {
    // nginx.org's own example: a URI after the address replaces the part the location matched.
    const withUri = readServer('server { location /name/ { proxy_pass http://127.0.0.1/remote/; } }');
    expect(upstreamUri(locationFor(withUri, '/name/x'), 'http://127.0.0.1/remote/', '/name/x')).toBe('/remote/x');

    // A bare "/" is a URI too: it strips the prefix, so /api/orders reaches Spring as /orders.
    const stripping = readServer('server { location /api/ { proxy_pass http://spring:8080/; } }');
    expect(upstreamUri(locationFor(stripping, '/api/orders'), 'http://spring:8080/', '/api/orders')).toBe('/orders');
    // A location without a trailing slash and a URI with one: the replacement is glued on and a doubled slash appears.
    const nested = readServer('server { location /api { proxy_pass http://spring:8080/api/; } }');
    expect(upstreamUri(locationFor(nested, '/api/orders'), 'http://spring:8080/api/', '/api/orders')).toBe('/api//orders');

    // The committed /api/ location has no URI, so the request goes on exactly as sent, even with a doubled slash.
    const api = locationFor(committed, '/api/orders');
    expect(proxyTarget(api)).toBe('http://spring:8080');
    expect(upstreamUri(api, 'http://spring:8080', '/api/orders?page=2')).toBe('/api/orders?page=2');
    expect(upstreamUri(api, 'http://spring:8080', '/api//orders')).toBe('/api//orders');
  });

  it('Section 4: without explicit Upgrade and Connection headers the backend receives a plain GET', () => {
    const upgrade = browser({ Upgrade: 'websocket', Connection: 'Upgrade' });
    // /api/ sets neither: the client's Upgrade and Connection are not passed, Connection is "close" and Host is $host.
    const plain = upstreamHeaders(committed, locationFor(committed, '/api/orders'), upgrade, maps);
    expect(plain['Upgrade']).toBeUndefined();
    expect(plain['Connection']).toBe('close');
    expect(plain['Host']).toBe('app.example.com');

    // With no proxy_set_header at all, Host falls back to $proxy_host, the address in proxy_pass.
    const bare = readServer('server { location /ws { proxy_pass http://spring:8080; } }');
    const defaults = upstreamHeaders(bare, locationFor(bare, '/ws'), upgrade, maps);
    expect(defaults).toEqual({ Accept: 'application/json', Host: 'spring:8080', Connection: 'close' });

    // /ws passes both explicitly; the map turns a missing Upgrade into "close".
    const socket = upstreamHeaders(committed, locationFor(committed, '/ws'), upgrade, maps);
    expect(socket['Upgrade']).toBe('websocket');
    expect(socket['Connection']).toBe('upgrade');
    expect(upstreamHeaders(committed, locationFor(committed, '/ws'), browser(), maps)['Connection']).toBe('close');

    // Every committed proxy location overwrites what a client sent: a forged X-Forwarded-For, -Proto and Forwarded.
    const forged = browser({ 'X-Forwarded-For': '1.2.3.4', 'X-Forwarded-Proto': 'https', Forwarded: 'for=1.2.3.4' });
    for (const uri of ['/api/orders', '/api/events', '/ws']) {
      const sent = upstreamHeaders(committed, locationFor(committed, uri), { ...forged, scheme: 'http' }, maps);
      expect(sent['X-Forwarded-For']).toBe('203.0.113.7');
      expect(sent['X-Forwarded-Proto']).toBe('http');
      expect(sent['Forwarded']).toBeUndefined();
    }
  });

  it('Section 4: an SSE stream silent for longer than proxy_read_timeout is closed and a 15-second heartbeat keeps it open', () => {
    // No proxy_read_timeout in the server: the 60-second default applies to /api/.
    const api = locationFor(committed, '/api/orders');
    expect(readTimeoutSeconds(committed, api)).toBe(60);
    // The committed stream locations raise it to one hour.
    expect(readTimeoutSeconds(committed, locationFor(committed, '/api/events'))).toBe(3600);
    expect(readTimeoutSeconds(committed, locationFor(committed, '/ws'))).toBe(3600);

    const timeout = 60;
    // One event at second 0, the next at second 90: the silence passes 60 seconds, so the connection closes at 60.
    expect(closedAt(timeout, [0, 90], 120)).toBe(60);
    // A comment every 15 seconds for five minutes: no silence reaches the timeout.
    const heartbeats = Array.from({ length: 21 }, (_unused, index) => index * 15);
    expect(closedAt(timeout, heartbeats, 300)).toBeUndefined();
    // The timeout counts silence, not total length: an hour of 59-second gaps stays open.
    const slow = Array.from({ length: 62 }, (_unused, index) => index * 59);
    expect(closedAt(timeout, slow, 3600)).toBeUndefined();
  });

  it('Section 4: our resolver trusts X-Forwarded-Proto only from a listed proxy address', () => {
    const trusted = ['10.0.0.0/8', '127.0.0.1'];
    const headers = { Host: 'spring:8080', 'X-Forwarded-Proto': 'https', 'X-Forwarded-Host': 'app.example.com', 'X-Forwarded-For': '203.0.113.7' };

    const viaProxy = resolveClient({ peer: '10.1.2.3', headers, scheme: 'http' }, trusted);
    expect(viaProxy).toEqual({ clientIp: '203.0.113.7', scheme: 'https', host: 'app.example.com' });

    // The same headers from an address that is not listed are ignored: the connection itself is the truth.
    const direct = resolveClient({ peer: '198.51.100.9', headers, scheme: 'http' }, trusted);
    expect(direct).toEqual({ clientIp: '198.51.100.9', scheme: 'http', host: 'spring:8080' });

    // A client that forges X-Forwarded-For through a trusted proxy that appends: the rightmost untrusted address wins.
    const appended = { ...headers, 'X-Forwarded-For': '1.2.3.4, 203.0.113.7' };
    expect(resolveClient({ peer: '10.1.2.3', headers: appended, scheme: 'http' }, trusted).clientIp).toBe('203.0.113.7');
    // Without a proxy header from a trusted peer, the connection's own scheme stays.
    expect(resolveClient({ peer: '127.0.0.1', headers: { Host: 'spring:8080' }, scheme: 'http' }, trusted).scheme).toBe('http');
  });
});
