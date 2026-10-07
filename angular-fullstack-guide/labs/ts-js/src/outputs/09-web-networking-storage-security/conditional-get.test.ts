// Q09.10 (Output question of module 09): a conditional GET with a matching ETag, Node 24 `fetch` against a local server.
// Node's fetch has no HTTP cache, so the test sends `If-None-Match` by hand, as a browser's cache would.
import { captureLogs } from '../capture';
import { createEtagHandler } from '../../modules/09-web-networking-storage-security/etag-handler';
import { startServer, type TestServer } from '../../modules/09-web-networking-storage-security/support/http-server';

let server: TestServer | undefined;
afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe('Module 09 · Output questions: conditional GET', () => {
  it('Q09.10 a matching If-None-Match gets 304 with an empty body and the same ETag; after the content changes it gets 200 and a new ETag', async () => {
    let content = 'version one';
    server = await startServer(createEtagHandler(() => content));
    const lines = await captureLogs(async (log) => {
      const console = { log };
      const first = await fetch(server!.baseUrl);
      const etag = first.headers.get('etag');
      console.log(first.status, await first.text());
      const second = await fetch(server!.baseUrl, { headers: { 'If-None-Match': etag! } });
      console.log(second.status, JSON.stringify(await second.text()), second.headers.get('etag') === etag);
      content = 'version two';
      const third = await fetch(server!.baseUrl, { headers: { 'If-None-Match': etag! } });
      console.log(third.status, await third.text(), third.headers.get('etag') === etag);
    });
    expect(lines).toEqual(['200 version one', '304 "" true', '200 version two false']);
  });
});
