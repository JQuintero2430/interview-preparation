// Section 3 (Node 24): connection and stream counts for six concurrent requests over HTTP/1.1 and HTTP/2 (cleartext h2c).
// The tests assert counts only, never milliseconds. HTTP/3 and TLS (what browsers use for HTTP/2) cannot be run here.
import { Agent, get } from 'node:http';
import { connect, createServer as createH2Server } from 'node:http2';
import { readBody, startServer } from './support/http-server.js';

const REQUESTS = 6;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Module 09 · section 3', () => {
  it('Section 3: six concurrent HTTP/1.1 requests through an agent limited to 2 sockets open 2 connections and run at most 2 at once', async () => {
    const sockets = new Set<object>();
    let inFlight = 0;
    let maxInFlight = 0;
    const server = await startServer(async (request, response) => {
      sockets.add(request.socket);
      maxInFlight = Math.max(maxInFlight, ++inFlight);
      await wait(50);
      inFlight--;
      response.end('ok');
    });
    const agent = new Agent({ keepAlive: true, maxSockets: 2 });
    try {
      const bodies = await Promise.all(
        Array.from(
          { length: REQUESTS },
          () =>
            new Promise<string>((resolve, reject) => {
              get(server.baseUrl, { agent }, (response) => resolve(readBody(response))).on('error', reject);
            }),
        ),
      );
      expect(bodies).toEqual(Array<string>(REQUESTS).fill('ok'));
      expect([sockets.size, maxInFlight]).toEqual([2, 2]);
    } finally {
      agent.destroy();
      await server.close();
    }
  });

  it('Section 3: six concurrent HTTP/2 requests share one session as six concurrent streams', async () => {
    const sessions = new Set<object>();
    let inFlight = 0;
    let maxInFlight = 0;
    const server = createH2Server(async (request, response) => {
      if (request.stream.session) sessions.add(request.stream.session);
      maxInFlight = Math.max(maxInFlight, ++inFlight);
      await wait(50);
      inFlight--;
      response.writeHead(200).end('ok');
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    const session = connect(`http://127.0.0.1:${port}`);
    try {
      const statuses = await Promise.all(
        Array.from(
          { length: REQUESTS },
          () =>
            new Promise<string | number | string[] | undefined>((resolve) => {
              const stream = session.request({ ':path': '/' });
              stream.on('response', (headers) => resolve(headers[':status'])).on('data', () => undefined);
              stream.end();
            }),
        ),
      );
      expect(statuses).toEqual(Array(REQUESTS).fill(200));
      expect([sessions.size, maxInFlight]).toEqual([1, REQUESTS]);
    } finally {
      session.close();
      await new Promise<void>((resolve) => server.close(resolve));
    }
  });
});
