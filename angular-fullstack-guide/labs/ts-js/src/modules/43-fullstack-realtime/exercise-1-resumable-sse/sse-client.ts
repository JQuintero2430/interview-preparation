// Exercise 43.1: a resumable Server-Sent Events client over an injected `fetch` (WHATWG HTML §9.2, read 2026-10-21).
// Our client, not the browser's `EventSource`. This file holds the shared parts: the types, the reconnection loop and
// the line-to-event step. Each variant supplies the step in between, how response bytes become lines, because that
// is where a chunk boundary can split a line or a CRLF. Nothing here reads the clock or opens a connection.

/** The part of `fetch` the client uses; the test passes a function that returns a `Response` over its own stream. */
export type FetchLike = (url: string, init: { headers: Record<string, string>; signal: AbortSignal }) => Promise<Response>;

export interface SseClientOptions {
  readonly url: string;
  readonly fetch: FetchLike;
  readonly headers?: Readonly<Record<string, string>>;
  /** The reconnection time in milliseconds until a `retry` field sets another. */
  readonly initialRetryMs: number;
}

/** One dispatched event, as a browser's `MessageEvent` would carry it. */
export interface SseEvent {
  readonly type: string;
  readonly data: string;
  readonly lastEventId: string;
}

/** `connecting` covers the first request and the wait before a reconnection, as `readyState` does. */
export type SseState = 'connecting' | 'open' | 'closed';

export interface SseClient {
  onEvent(listener: (event: SseEvent) => void): void;
  onState(listener: (state: SseState) => void): void;
  /** Starts connecting. Register listeners first. */
  start(): void;
  /** Aborts the request, cancels a pending reconnection and ends in `closed`. */
  close(): void;
}

/** Turns a response body into lines, with the terminators removed. A variant's own work; see `a/` and `b/`. */
export type LineReader = (body: ReadableStream<Uint8Array<ArrayBuffer>>) => AsyncIterable<string>;

const EVENT_STREAM = 'text/event-stream';
const DIGITS_ONLY = /^[0-9]+$/;

export function createSseClient(options: SseClientOptions, readLines: LineReader): SseClient {
  const eventListeners: ((event: SseEvent) => void)[] = [];
  const stateListeners: ((state: SseState) => void)[] = [];
  const abort = new AbortController();
  let state: SseState = 'connecting';
  let timer: ReturnType<typeof setTimeout> | undefined;
  let retryMs = options.initialRetryMs;
  let lastEventId = '';
  let idBuffer = '';

  function setState(next: SseState): void {
    if (state === 'closed' || next === state) return;
    state = next;
    for (const listener of stateListeners) listener(next);
  }

  // The per-connection event under construction; a dropped connection discards it (§9.2.6, the end of the stream).
  function eventBuilder(): (line: string) => void {
    let data = '';
    let type = '';
    return (line) => {
      if (line === '') {
        lastEventId = idBuffer;
        if (data !== '') {
          const event: SseEvent = { type: type || 'message', data: data.slice(0, -1), lastEventId };
          for (const listener of eventListeners) listener(event);
        }
        data = '';
        type = '';
        return;
      }
      if (line.startsWith(':')) return;
      const colon = line.indexOf(':');
      const field = colon === -1 ? line : line.slice(0, colon);
      const raw = colon === -1 ? '' : line.slice(colon + 1);
      const value = raw.startsWith(' ') ? raw.slice(1) : raw;
      if (field === 'data') data += `${value}\n`;
      else if (field === 'event') type = value;
      else if (field === 'id' && !value.includes('\0')) idBuffer = value;
      else if (field === 'retry' && DIGITS_ONLY.test(value)) retryMs = Number.parseInt(value, 10);
    };
  }

  /** The body of a 200 `text/event-stream` response; anything else (a 204 included) "fails the connection". */
  function streamOf(response: Response): ReadableStream<Uint8Array<ArrayBuffer>> | undefined {
    const mime = response.headers.get('Content-Type')?.split(';')[0]?.trim().toLowerCase();
    return response.status === 200 && mime === EVENT_STREAM ? (response.body ?? undefined) : undefined;
  }

  async function read(body: ReadableStream<Uint8Array<ArrayBuffer>>): Promise<void> {
    const feed = eventBuilder();
    try {
      for await (const line of readLines(body)) feed(line);
    } catch {
      // A body that errors is a dropped connection: the caller reconnects.
    }
  }

  async function connect(): Promise<void> {
    timer = undefined;
    const headers = { Accept: EVENT_STREAM, ...options.headers, ...(lastEventId === '' ? {} : { 'Last-Event-ID': lastEventId }) };
    try {
      const response = await options.fetch(options.url, { headers, signal: abort.signal });
      const body = streamOf(response);
      if (body === undefined) return setState('closed');
      setState('open');
      await read(body);
    } catch {
      // A network error reconnects like a body that ends.
    }
    if (abort.signal.aborted) return;
    setState('connecting');
    timer = setTimeout(() => void connect(), retryMs);
  }

  return {
    onEvent: (listener) => void eventListeners.push(listener),
    onState: (listener) => void stateListeners.push(listener),
    start: () => void connect(),
    close() {
      abort.abort();
      clearTimeout(timer);
      setState('closed');
    },
  };
}
