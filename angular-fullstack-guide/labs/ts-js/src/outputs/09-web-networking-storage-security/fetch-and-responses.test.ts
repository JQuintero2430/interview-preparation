// Q09.03 and Q09.05 (Output questions of module 09, Node 24 `fetch` against a local server).
// Q09.01, Q09.02 and Q09.04 and Q09.06-Q09.08 are documentation answers; their lab evidence is in the section 1-3 tests.
import { captureLogs } from '../capture';
import { readBody, startServer, type TestServer } from '../../modules/09-web-networking-storage-security/support/http-server';

let server: TestServer | undefined;
afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe('Module 09 · Output questions: fetch and responses', () => {
  it('Q09.03 a 404 resolves, a refused connection rejects with TypeError, a POST redirected with 302 becomes GET and with 307 stays POST', async () => {
    server = await startServer(async (request, response) => {
      const code = /^\/r\/(\d{3})$/.exec(request.url ?? '')?.[1];
      if (request.url === '/missing') response.writeHead(404).end('missing');
      else if (code) response.writeHead(Number(code), { Location: '/echo' }).end();
      else response.end(`${request.method}:${await readBody(request)}`);
    });
    const base = server.baseUrl;
    const closed = await startServer((_request, response) => response.end());
    const closedUrl = closed.baseUrl;
    await closed.close();
    const lines = await captureLogs(async (log) => {
      const console = { log };
      const missing = await fetch(`${base}/missing`);
      console.log(missing.status, missing.ok);
      const refused = await fetch(closedUrl).catch((error: Error) => error);
      console.log(refused instanceof TypeError, refused instanceof Error && refused.message);
      for (const code of [302, 307]) {
        const response = await fetch(`${base}/r/${code}`, { method: 'POST', body: 'x' });
        console.log(code, await response.text());
      }
    });
    expect(lines).toEqual(['404 false', 'true fetch failed', '302 GET:', '307 POST:x']);
  });

  it('Q09.05 a body is read once, clone() before reading keeps a copy, Headers join duplicates but not Set-Cookie', async () => {
    const lines = await captureLogs(async (log) => {
      const console = { log };
      const response = new Response('hello');
      const copy = response.clone();
      console.log(await response.text(), response.bodyUsed);
      const second = await response.text().catch((error: Error) => error);
      console.log(second.constructor.name);
      console.log(await copy.text());
      const headers = new Headers({ 'Content-Type': 'text/plain' });
      headers.append('X-Id', '1');
      headers.append('x-id', '2');
      headers.append('Set-Cookie', 'a=1');
      headers.append('Set-Cookie', 'b=2');
      console.log(headers.get('CONTENT-TYPE'), headers.get('x-id'));
      console.log(headers.getSetCookie());
    });
    expect(lines).toEqual(['hello true', 'TypeError', 'hello', 'text/plain 1, 2', "[ 'a=1', 'b=2' ]"]);
  });

  it('Q09.05 follow-up: clone() after the body was read throws a TypeError', async () => {
    const response = new Response('hello');
    await response.text();
    expect(() => response.clone()).toThrow(TypeError);
  });
});
