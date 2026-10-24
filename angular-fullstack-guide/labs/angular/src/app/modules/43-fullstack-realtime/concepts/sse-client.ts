// Section 4 client: an Observable over a platform source. Angular ships no SSE API (nothing in `@angular/common` or
// `@angular/core` 22.2.1 mentions `EventSource`), so the wrapper is ours. Both functions are cold: each subscriber opens
// its own connection and teardown ends it. `labs/ts-js` holds the complete event-stream parser (Section 2); a
// separate package cannot be imported here, so `fromFetchStream` carries a small LF-only subset of it.
import { Component, Injector, InjectionToken, afterNextRender, computed, inject, signal, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

export interface SseMessage {
  readonly type: string;
  readonly data: string;
  readonly lastEventId: string;
}

const CLOSED = 2;

export interface EventSourceLike {
  readonly readyState: number;
  addEventListener(type: string, listener: (event: Event) => void): void;
  close(): void;
}

export type EventSourceFactory = (url: string, init: { withCredentials: boolean }) => EventSourceLike;

const browserSource: EventSourceFactory = (url, init) => new EventSource(url, init);

export interface EventSourceOptions {
  readonly withCredentials?: boolean;
  /** Named events to listen for; `message` is always listened for. */
  readonly events?: readonly string[];
  readonly factory?: EventSourceFactory;
}

export function fromEventSource(url: string, options: EventSourceOptions = {}): Observable<SseMessage> {
  const { withCredentials = false, events = [], factory = browserSource } = options;
  return new Observable<SseMessage>((subscriber) => {
    const source = factory(url, { withCredentials });
    for (const type of ['message', ...events]) {
      source.addEventListener(type, (event) => {
        if (event instanceof MessageEvent) {
          subscriber.next({ type: event.type, data: String(event.data), lastEventId: event.lastEventId });
        }
      });
    }
    // `error` fires for a reconnect and for a failure; only CLOSED means the browser gave up.
    source.addEventListener('error', () => {
      if (source.readyState === CLOSED) subscriber.error(new Error(`EventSource to ${url} failed`));
    });
    return () => source.close();
  });
}

export type FetchFn = (url: string, init: { headers: Record<string, string>; signal: AbortSignal }) => Promise<Response>;

export function fromFetchStream(fetchFn: FetchFn, url: string, headers: Record<string, string> = {}): Observable<SseMessage> {
  return new Observable<SseMessage>((subscriber) => {
    const aborter = new AbortController();
    pump(fetchFn, url, headers, aborter.signal, (message) => subscriber.next(message)).then(
      () => subscriber.complete(),
      (error: unknown) => {
        if (!aborter.signal.aborted) subscriber.error(error);
      },
    );
    return () => aborter.abort();
  });
}

async function pump(
  fetchFn: FetchFn,
  url: string,
  headers: Record<string, string>,
  signal: AbortSignal,
  onMessage: (message: SseMessage) => void,
): Promise<void> {
  const response = await fetchFn(url, { headers, signal });
  if (!response.ok || response.body === null) throw new Error(`SSE request failed with status ${response.status}`);
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  const parse = lineParser(onMessage);
  for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) parse(chunk.value);
}

// A subset of Section 2's parser: LF line ends only, fields `event`, `data` and `id`, no `retry`.
function lineParser(onMessage: (message: SseMessage) => void): (chunk: string) => void {
  let buffer = '';
  let type = '';
  let lastEventId = '';
  let data: string[] = [];
  const handle = (line: string): void => {
    if (line === '') {
      if (data.length > 0) onMessage({ type: type || 'message', data: data.join('\n'), lastEventId });
      type = '';
      data = [];
      return;
    }
    const colon = line.indexOf(':');
    if (colon < 1) return;
    const value = line.slice(colon + 1).replace(/^ /, '');
    const field = line.slice(0, colon);
    if (field === 'data') data.push(value);
    else if (field === 'event') type = value;
    else if (field === 'id') lastEventId = value;
  };
  return (chunk) => {
    const lines = (buffer + chunk).split('\n');
    buffer = lines.pop() ?? '';
    lines.forEach(handle);
  };
}

export const LAB_M43_SSE_FACTORY = new InjectionToken<EventSourceFactory>('LAB_M43_SSE_FACTORY', {
  providedIn: 'root',
  factory: () => browserSource,
});

/** Opens the stream after the first render, so a server render never constructs an `EventSource`. */
@Component({ selector: 'lab-m43-live-value', template: `<p>{{ latest()?.data ?? 'waiting' }}</p>` })
export class LabM43LiveValue {
  private readonly injector = inject(Injector);
  private readonly factory = inject(LAB_M43_SSE_FACTORY);
  private readonly source = signal<Signal<SseMessage | undefined> | undefined>(undefined);
  protected readonly latest = computed(() => this.source()?.());

  constructor() {
    afterNextRender(() => {
      const stream = fromEventSource('/api/prices', { events: ['price'], factory: this.factory });
      this.source.set(toSignal(stream, { injector: this.injector }));
    });
  }
}
