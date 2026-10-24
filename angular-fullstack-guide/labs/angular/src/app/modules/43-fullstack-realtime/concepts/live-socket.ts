// Section 6 client: RxJS `webSocket` plus a reconnect policy. `webSocket` reconnects nothing by itself (RxJS 7.8.2
// `WebSocketSubject.ts`): a clean close completes the stream, an unclean close or an `error` event errors it, and the
// next subscription opens a new socket. So `retry` re-subscribes after an error, `repeat` after a complete, each after a
// backoff, and `openObserver` resends whatever the server must know on every open. One subscriber per `liveSocket`;
// sharing the connection is Section 8's job. The wire message type `T` is both what the server sends and what we send.
import { Observable, repeat, retry, timer } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

export interface Backoff {
  readonly initialMs: number;
  readonly maxMs: number;
}

export interface LiveSocketConfig<T> {
  readonly url: string;
  readonly backoff: Backoff;
  /** Injected so a test fixes the jitter; production passes `Math.random`. */
  readonly random: () => number;
  /** Messages the server must see again on every open, such as a subscribe request per topic. */
  readonly resubscribe?: () => readonly T[];
  readonly WebSocketCtor?: new (url: string, protocols?: string | string[]) => WebSocket;
}

export interface LiveSocket<T> {
  readonly messages$: Observable<T>;
  /** Buffered by `WebSocketSubject` until the socket opens, then sent in order. */
  send(message: T): void;
}

/** Exponential from `initialMs`, capped at `maxMs`, then a random share of it (RFC 6455 §7.2.3: a random, growing delay). */
export function backoffDelay(attempt: number, { initialMs, maxMs }: Backoff, random: () => number): number {
  return Math.round(Math.min(maxMs, initialMs * 2 ** (attempt - 1)) * random());
}

export function liveSocket<T>(config: LiveSocketConfig<T>): LiveSocket<T> {
  // Our own counter, reset on every open: `retry`'s `resetOnSuccess` resets only when a value arrives, and `repeat`
  // never resets, so a quiet server or hours between clean closes would keep growing the wait.
  let attempt = 0;
  const subject = webSocket<T>({
    url: config.url,
    WebSocketCtor: config.WebSocketCtor,
    openObserver: {
      next: () => {
        attempt = 0;
        for (const message of config.resubscribe?.() ?? []) subject.next(message);
      },
    },
  });
  const wait = () => timer(backoffDelay(++attempt, config.backoff, config.random));
  return {
    messages$: subject.pipe(retry({ delay: wait }), repeat({ delay: wait })),
    send: (message) => subject.next(message),
  };
}
