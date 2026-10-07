// Section 5 (Node 24 `fetch` against a local server): what a server sends for CORS, and proof that Node, unlike a browser, enforces nothing.
// Every browser-side rule (hiding the response, preflight, the preflight cache) is cited in the module text, never run here.
import { startServer, type Handler, type TestServer } from './support/http-server.js';

let server: TestServer | undefined;
afterEach(async () => {
  await server?.close();
  server = undefined;
});

const ALLOWED_ORIGINS = ['https://app.example.com'];

/** An API that answers a preflight and adds CORS headers only for an allow-listed origin. */
const corsApi: Handler = (request, response) => {
  const origin = request.headers['origin'];
  const allowed = typeof origin === 'string' && ALLOWED_ORIGINS.includes(origin);
  const base: Record<string, string> = allowed
    ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true', Vary: 'Origin' }
    : { Vary: 'Origin' };
  if (request.method === 'OPTIONS') {
    response.writeHead(204, { ...base, 'Access-Control-Allow-Methods': 'GET, PUT', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600' }).end();
    return;
  }
  response.writeHead(200, base).end('data');
};

describe('Module 09 · section 5', () => {
  it('Section 5: Node fetch reads a response that has no CORS headers, so "works in curl or Node" says nothing about a browser', async () => {
    server = await startServer((_request, response) => response.end('secret'));
    const response = await fetch(server.baseUrl, { headers: { Origin: 'https://evil.example' } });
    expect([await response.text(), response.headers.get('access-control-allow-origin')]).toEqual(['secret', null]);
  });

  it('Section 5: a request with a foreign Origin still reaches the server and runs its side effect', async () => {
    let writes = 0;
    server = await startServer((_request, response) => {
      writes++;
      response.end('done');
    });
    await fetch(server.baseUrl, { method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'text/plain' }, body: 'transfer' });
    expect(writes).toBe(1);
  });

  it('Section 5: an allow-listed origin gets Allow-Origin, Allow-Credentials and Vary: Origin; another origin gets no Allow-Origin', async () => {
    server = await startServer(corsApi);
    const asked = (origin: string) => fetch(server!.baseUrl, { headers: { Origin: origin } });
    const allowed = await asked('https://app.example.com');
    expect([allowed.headers.get('access-control-allow-origin'), allowed.headers.get('access-control-allow-credentials'), allowed.headers.get('vary')]).toEqual([
      'https://app.example.com',
      'true',
      'Origin',
    ]);
    const other = await asked('https://evil.example');
    expect([other.headers.get('access-control-allow-origin'), other.headers.get('vary')]).toEqual([null, 'Origin']);
  });

  it('Section 5: a preflight answer lists the allowed methods and headers, a max age, and carries no body', async () => {
    server = await startServer(corsApi);
    const preflight = await fetch(server.baseUrl, {
      method: 'OPTIONS',
      headers: { Origin: 'https://app.example.com', 'Access-Control-Request-Method': 'PUT', 'Access-Control-Request-Headers': 'content-type' },
    });
    expect([preflight.status, preflight.headers.get('access-control-allow-methods'), preflight.headers.get('access-control-allow-headers'), preflight.headers.get('access-control-max-age'), await preflight.text()]).toEqual([
      204,
      'GET, PUT',
      'Content-Type',
      '600',
      '',
    ]);
  });

  it('Section 5: an origin is scheme, host and port; the path is ignored and a default port is dropped', () => {
    const origin = (url: string) => new URL(url).origin;
    expect(origin('https://app.example.com/a/b?q=1')).toBe(origin('https://app.example.com:443/other'));
    expect(origin('https://app.example.com')).not.toBe(origin('https://api.example.com'));
    expect(origin('https://app.example.com')).not.toBe(origin('http://app.example.com'));
    expect(origin('https://app.example.com')).not.toBe(origin('https://app.example.com:8443'));
  });
});
