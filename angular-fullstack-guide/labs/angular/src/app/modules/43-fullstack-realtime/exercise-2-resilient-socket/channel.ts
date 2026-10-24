// Exercise 43.2: a resilient WebSocket channel. Our channel, not rx-stomp's. This file holds what both variants share:
// the types, our JSON wire format with a bare LF as the server's heart-beat (as in STOMP 1.2), the jittered backoff,
// and the session bookkeeping (active topics, the outgoing queue, the state signal, when the backoff resets). Each
// variant supplies the socket lifecycle: opening, the heart-beat watchdog and scheduling the reconnection.
// Nothing here opens a connection or reads the clock; the tests pass our fake socket as `WebSocketCtor`.
import { signal, type Signal } from '@angular/core';
import { Subject, type Observable } from 'rxjs';

export interface ChannelConfig {
  readonly url: string;
  readonly backoff: { readonly initialMs: number; readonly maxMs: number };
  /** The server's heart-beat interval; two of them without a frame mean the connection is dead. */
  readonly heartbeatMs: number;
  /** Injected so a test fixes the jitter; production passes `Math.random`. */
  readonly random: () => number;
  /** Production passes `WebSocket`; the tests pass our fake. */
  readonly WebSocketCtor: new (url: string) => WebSocket;
}

/** `connecting` is the first attempt; `reconnecting` covers every wait and attempt after a drop. */
export type ChannelState = 'connecting' | 'open' | 'reconnecting' | 'closed';

export interface ChannelMessage {
  readonly topic: string;
  readonly body: string;
}

export interface Channel {
  readonly messages$: Observable<ChannelMessage>;
  readonly state: Signal<ChannelState>;
  /** Returns the function that leaves the topic. */
  subscribe(topic: string): () => void;
  send(message: ChannelMessage): void;
  close(): void;
}

export type WireFrame =
  | { readonly type: 'subscribe' | 'unsubscribe'; readonly topic: string }
  | { readonly type: 'send' | 'message'; readonly topic: string; readonly body: string };

/** A server heart-beat: one LF, like STOMP 1.2's EOL heart-beat. */
export const HEARTBEAT = '\n';

/** Doubles from `initialMs` up to `maxMs`, then a random point in the upper half, so no client retries at once. */
export function backoffDelay(attempt: number, { initialMs, maxMs }: ChannelConfig['backoff'], random: () => number): number {
  const ceiling = Math.min(maxMs, initialMs * 2 ** (attempt - 1));
  return Math.round(ceiling * (0.5 + random() / 2));
}

/** A `message` frame becomes a `ChannelMessage`; a heart-beat or any other frame becomes nothing. */
export function decodeFrame(data: string): ChannelMessage | undefined {
  if (data === HEARTBEAT) return undefined;
  const frame: unknown = JSON.parse(data);
  return isMessage(frame) ? { topic: frame.topic, body: frame.body } : undefined;
}

function isMessage(value: unknown): value is { type: 'message'; topic: string; body: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'message' &&
    'topic' in value &&
    typeof value.topic === 'string' &&
    'body' in value &&
    typeof value.body === 'string'
  );
}

/** What the channel remembers across connections. The variants call `opened`, `received`, `dropped` and `closed`. */
export class ChannelSession {
  private readonly current = signal<ChannelState>('connecting');
  private readonly messages = new Subject<ChannelMessage>();
  private readonly topics = new Set<string>();
  private readonly queue: string[] = [];
  private transmit: ((data: string) => void) | undefined;
  private attempt = 0;
  private stable: ReturnType<typeof setTimeout> | undefined;

  constructor(private readonly config: ChannelConfig) {}

  /** The socket opened: resend every active subscription, then flush the queue in order. */
  opened(transmit: (data: string) => void): void {
    this.transmit = transmit;
    this.current.set('open');
    for (const topic of this.topics) transmit(JSON.stringify({ type: 'subscribe', topic }));
    for (const data of this.queue.splice(0)) transmit(data);
    // An open that dies at once is not a success: reset the backoff only after one quiet heart-beat interval.
    this.stable = setTimeout(() => (this.attempt = 0), this.config.heartbeatMs);
  }

  received(data: string): void {
    const message = decodeFrame(data);
    if (message !== undefined) this.messages.next(message);
  }

  /** The socket is gone and the channel will reconnect; returns the wait before the next attempt. */
  dropped(): number {
    this.detach();
    this.current.set('reconnecting');
    return backoffDelay(++this.attempt, this.config.backoff, this.config.random);
  }

  closed(): void {
    this.detach();
    this.current.set('closed');
    this.messages.complete();
  }

  /** The public API over a variant's `stop`, which tears its socket and timers down. */
  channel(stop: () => void): Channel {
    return {
      messages$: this.messages.asObservable(),
      state: this.current.asReadonly(),
      subscribe: (topic) => {
        this.topics.add(topic);
        this.transmit?.(JSON.stringify({ type: 'subscribe', topic }));
        return () => {
          if (this.topics.delete(topic)) this.transmit?.(JSON.stringify({ type: 'unsubscribe', topic }));
        };
      },
      send: (message) => {
        const data = JSON.stringify({ type: 'send', ...message });
        if (this.transmit === undefined) this.queue.push(data);
        else this.transmit(data);
      },
      close: () => {
        stop();
        this.closed();
      },
    };
  }

  private detach(): void {
    this.transmit = undefined;
    clearTimeout(this.stable);
  }
}
