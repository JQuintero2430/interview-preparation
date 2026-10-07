// Section 1 (Node 24 `fetch`, which is undici, against a local server): status handling, redirect method rewriting and `Headers`.
import { readBody, startServer, type TestServer } from './support/http-server.js';

let server: TestServer | undefined;
afterEach(async () => {
  await server?.close();
  server = undefined;
});

/** `/redirect/<code>` answers with that status and `Location: /echo`; `/echo` reports the method and body it received. */
const redirectServer = () =>
  startServer(async (request, response) => {
    const code = /^\/redirect\/(\d{3})$/.exec(request.url ?? '')?.[1];
    if (code) {
      response.writeHead(Number(code), { Location: '/echo' }).end();
      return;
    }
    response.end(`${request.method}:${await readBody(request)}`);
  });

describe('Module 09 · section 1', () => {
  it('Section 1: fetch resolves on a 404 and only ok tells success', async () => {
    server = await startServer((_request, response) => response.writeHead(404).end('missing'));
    const response = await fetch(`${server.baseUrl}/nope`);
    expect([response.status, response.ok, response.statusText, await response.text()]).toEqual([404, false, 'Not Found', 'missing']);
  });

  it('Section 1: fetch rejects with a TypeError when the connection is refused', async () => {
    const closed = await startServer((_request, response) => response.end());
    const url = closed.baseUrl;
    await closed.close();
    const failure = await fetch(url).then(
      () => undefined,
      (error: unknown) => error,
    );
    expect(failure).toBeInstanceOf(TypeError);
    expect((failure as TypeError).message).toBe('fetch failed');
  });

  it('Section 1: a POST through 301, 302 and 303 is repeated as a GET without a body; 307 and 308 keep method and body', async () => {
    server = await redirectServer();
    const seen: Record<number, string> = {};
    for (const code of [301, 302, 303, 307, 308]) {
      const response = await fetch(`${server.baseUrl}/redirect/${code}`, { method: 'POST', body: 'x' });
      seen[code] = await response.text();
    }
    expect(seen).toEqual({ 301: 'GET:', 302: 'GET:', 303: 'GET:', 307: 'POST:x', 308: 'POST:x' });
  });

  it('Section 1: redirect "manual" hands the 302 and its Location header to the caller (Node; a browser hides them)', async () => {
    server = await redirectServer();
    const response = await fetch(`${server.baseUrl}/redirect/302`, { redirect: 'manual' });
    expect([response.status, response.type, response.headers.get('location')]).toEqual([302, 'basic', '/echo']);
  });

  it('Section 1: header names are case-insensitive and duplicates join with a comma', () => {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append('X-Id', '1');
    headers.append('x-id', '2');
    expect([headers.get('CONTENT-TYPE'), headers.get('X-ID')]).toEqual(['application/json', '1, 2']);
  });

  it('Section 1: Set-Cookie is the exception, getSetCookie() keeps the values apart', () => {
    const headers = new Headers();
    headers.append('Set-Cookie', 'a=1');
    headers.append('Set-Cookie', 'b=2');
    expect(headers.getSetCookie()).toEqual(['a=1', 'b=2']);
    expect(headers.get('set-cookie')).toBe('a=1, b=2');
  });
});
