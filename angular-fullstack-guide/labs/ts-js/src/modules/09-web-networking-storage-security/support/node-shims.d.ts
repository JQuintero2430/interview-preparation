// Minimal typings for the Node modules the module 09 labs use. `@types/node` is not a dependency of
// labs/ts-js (SEC-M09-01 may not add one), so these declare only the members the labs call. If
// `@types/node` is ever added, delete this file: both would declare the same modules.
declare module 'node:http' {
  type HeaderValue = string | number | readonly string[];

  interface IncomingMessage extends AsyncIterable<Uint8Array> {
    readonly url?: string;
    readonly method?: string;
    readonly headers: Readonly<Record<string, string | string[] | undefined>>;
    /** The connection the message arrived on; compared by identity to count connections. */
    readonly socket: object;
  }

  /** Connection pool settings (`maxSockets` caps parallel connections per origin). */
  class Agent {
    constructor(options?: { readonly keepAlive?: boolean; readonly maxSockets?: number });
    destroy(): void;
  }

  interface ServerResponse {
    readonly headersSent: boolean;
    writeHead(status: number, headers?: Readonly<Record<string, HeaderValue>>): ServerResponse;
    setHeader(name: string, value: HeaderValue): ServerResponse;
    write(chunk: string | Uint8Array): boolean;
    end(chunk?: string | Uint8Array): ServerResponse;
  }

  interface Server {
    listen(port: number, host: string, onListening: () => void): Server;
    close(onClosed?: (error?: Error) => void): Server;
    closeAllConnections(): void;
    address(): { readonly port: number } | string | null;
  }

  function createServer(listener: (request: IncomingMessage, response: ServerResponse) => void): Server;

  /** Sends a `GET`; the callback receives the response, which can be read as an async iterable. */
  function get(url: string, options: { readonly agent: Agent }, onResponse: (response: IncomingMessage) => void): { on(event: 'error', listener: (error: Error) => void): unknown };
}

declare module 'node:http2' {
  interface Http2ServerRequest {
    readonly url: string;
    readonly stream: { readonly session?: object };
  }

  interface Http2ServerResponse {
    writeHead(status: number, headers?: Readonly<Record<string, string | number>>): Http2ServerResponse;
    end(chunk?: string): void;
  }

  interface Http2Server {
    listen(port: number, host: string, onListening: () => void): Http2Server;
    close(onClosed?: () => void): void;
    address(): { readonly port: number } | string | null;
  }

  interface ClientHttp2Stream {
    on(event: 'response', listener: (headers: Readonly<Record<string, string | number | string[] | undefined>>) => void): ClientHttp2Stream;
    on(event: 'data', listener: (chunk: Uint8Array) => void): ClientHttp2Stream;
    on(event: 'end', listener: () => void): ClientHttp2Stream;
    end(): void;
  }

  interface ClientHttp2Session {
    request(headers: Readonly<Record<string, string>>): ClientHttp2Stream;
    close(): void;
  }

  /** Cleartext HTTP/2 (h2c): browsers speak HTTP/2 over TLS only, but the protocol framing is the same. */
  function createServer(listener: (request: Http2ServerRequest, response: Http2ServerResponse) => void): Http2Server;
  function connect(authority: string): ClientHttp2Session;
}
