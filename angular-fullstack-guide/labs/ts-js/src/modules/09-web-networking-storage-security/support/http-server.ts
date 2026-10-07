// Shared local HTTP server for the module 09 labs (built by SEC-M09-01, read-only for later tasks).
// It listens on 127.0.0.1 with an OS-assigned port, so tests never collide and never touch the internet.
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

export type Handler = (request: IncomingMessage, response: ServerResponse) => unknown;

export interface TestServer {
  /** For example `http://127.0.0.1:41873`, without a trailing slash. */
  readonly baseUrl: string;
  /** Stops listening and drops open keep-alive sockets, so `afterEach` never waits for them. */
  close(): Promise<void>;
}

/** Starts a server that runs `handler` for every request. Handler errors become a 500. */
export const startServer = async (handler: Handler): Promise<TestServer> => {
  const server = createServer((request, response) => {
    Promise.resolve(handler(request, response)).catch(() => {
      if (!response.headersSent) response.writeHead(500);
      response.end();
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  };
};

/** Reads the whole request body as UTF-8 text (empty string when there is none). */
export const readBody = async (request: IncomingMessage): Promise<string> => {
  const chunks: Uint8Array[] = [];
  for await (const chunk of request) chunks.push(chunk);
  return new Blob(chunks as BlobPart[]).text();
};
