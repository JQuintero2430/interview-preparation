// Section 4 (Node 24 `fetch` against a local server): conditional GET with an ETag, the file-name hash, and the absence of an HTTP cache in Node.
import { createEtagHandler, etagOf, hashedFileName, matchesIfNoneMatch } from './etag-handler.js';
import { startServer, type TestServer } from './support/http-server.js';

let server: TestServer | undefined;
afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe('Module 09 · section 4', () => {
  it('Section 4: a conditional GET gives 200, then 304 with an empty body, then 200 with a new ETag after the content changes', async () => {
    let content = 'version one';
    server = await startServer(createEtagHandler(() => content));

    const first = await fetch(server.baseUrl);
    const etag = first.headers.get('etag')!;
    expect([first.status, await first.text()]).toEqual([200, 'version one']);

    const second = await fetch(server.baseUrl, { headers: { 'If-None-Match': etag } });
    expect([second.status, await second.text(), second.headers.get('etag')]).toEqual([304, '', etag]);

    content = 'version two';
    const third = await fetch(server.baseUrl, { headers: { 'If-None-Match': etag } });
    expect([third.status, await third.text()]).toEqual([200, 'version two']);
    expect(third.headers.get('etag')).not.toBe(etag);
  });

  it('Section 4: If-None-Match uses the weak comparison, accepts a list and "*"', async () => {
    const etag = await etagOf('body');
    expect(matchesIfNoneMatch(`W/${etag}`, etag)).toBe(true);
    expect(matchesIfNoneMatch(`"other", ${etag}`, etag)).toBe(true);
    expect(matchesIfNoneMatch('*', etag)).toBe(true);
    expect(matchesIfNoneMatch('"other"', etag)).toBe(false);
    expect(matchesIfNoneMatch(undefined, etag)).toBe(false);
  });

  it('Section 4: a content-hashed file name is stable for the same content and changes with it', async () => {
    const one = await hashedFileName('app.js', 'console.log(1)');
    expect(await hashedFileName('app.js', 'console.log(1)')).toBe(one);
    expect(one).toMatch(/^app\.[0-9a-f]{8}\.js$/);
    expect(await hashedFileName('app.js', 'console.log(2)')).not.toBe(one);
  });

  it('Section 4: Node fetch has no HTTP cache, so even a fresh response is requested again', async () => {
    let hits = 0;
    server = await startServer((_request, response) => {
      hits++;
      response.writeHead(200, { 'Cache-Control': 'max-age=3600' }).end('cached?');
    });
    await (await fetch(server.baseUrl)).text();
    await (await fetch(server.baseUrl)).text();
    expect(hits).toBe(2);
  });
});
