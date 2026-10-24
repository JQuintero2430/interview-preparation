// Exercise 43.3: a live board. Our board protocol, not a library's. This file holds what both variants share: the types,
// the socket source (one socket per subscription, a state signal, a fixed reconnect wait; Exercise 43.2 owns backoff),
// the ordering rule, and `BoardConnection`, which turns deltas into conflated boards and shares one socket among every
// reader with a grace period. Each variant supplies the reader: a, a signals service handing out `toSignal`; b,
// `rxResource` with `stream`. Nothing opens a socket until a reader subscribes, and the components subscribe only after
// the first render, so a server render opens nothing. The tests pass our fake socket as `WebSocketCtor`.
import { Injectable, InjectionToken, inject, signal, type Signal } from '@angular/core';
import { Observable, auditTime, defer, finalize, repeat, retry, share, timer, type OperatorFunction } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

export interface Card {
  readonly id: string;
  readonly title: string;
  readonly column: string;
}

/** The board as of sequence number `seq`: what the HTTP load returns, and every board the readers see. */
export interface BoardSnapshot {
  readonly seq: number;
  readonly cards: readonly Card[];
}

/** One numbered change: the card's new version, replacing the card with the same id or added at the end. */
export interface BoardDelta {
  readonly seq: number;
  readonly change: Card;
}

export type ConnectionState = 'connecting' | 'open' | 'reconnecting' | 'closed';

export interface BoardSource {
  /** The board as the server has it now (an HTTP load in production). */
  snapshot(): Promise<BoardSnapshot>;
  /** Cold: every subscription opens its own socket, so sharing is `BoardConnection`'s job. */
  readonly deltas$: Observable<BoardDelta>;
  readonly state: Signal<ConnectionState>;
}

export interface BoardOptions {
  /** How long the socket stays open after the last reader leaves. */
  readonly graceMs: number;
  /** The conflation window: at most one board per window reaches the readers. */
  readonly windowMs: number;
}

export const BOARD_SOURCE = new InjectionToken<BoardSource>('BOARD_SOURCE');
export const BOARD_OPTIONS = new InjectionToken<BoardOptions>('BOARD_OPTIONS');

export interface SocketBoardConfig {
  readonly url: string;
  readonly reconnectMs: number;
  readonly snapshot: () => Promise<BoardSnapshot>;
  /** Production passes `WebSocket`; the tests pass our fake. */
  readonly WebSocketCtor: new (url: string, protocols?: string | string[]) => WebSocket;
}

export function socketBoardSource(config: SocketBoardConfig): BoardSource {
  const state = signal<ConnectionState>('closed');
  const wait = () => timer(config.reconnectMs);
  const deltas$ = defer(() => {
    // A retry runs this again: keep `reconnecting` until the new socket opens.
    state.update((now) => (now === 'closed' ? 'connecting' : now));
    return webSocket<BoardDelta>({
      url: config.url,
      WebSocketCtor: config.WebSocketCtor,
      openObserver: { next: () => state.set('open') },
      // A browser fires `close` after our own teardown too; that one must not overwrite `closed`.
      closeObserver: { next: () => state.update((now) => (now === 'closed' ? now : 'reconnecting')) },
    });
  }).pipe(
    retry({ delay: wait }),
    repeat({ delay: wait }),
    finalize(() => state.set('closed')),
  );
  return { snapshot: config.snapshot, deltas$, state: state.asReadonly() };
}

/** The next board; the same board for a delta it already holds; `'gap'` when a sequence number was skipped. */
export function advance(board: BoardSnapshot, delta: BoardDelta): BoardSnapshot | 'gap' {
  if (delta.seq <= board.seq) return board;
  if (delta.seq > board.seq + 1) return 'gap';
  const { change } = delta;
  const known = board.cards.some((card) => card.id === change.id);
  const cards = known ? board.cards.map((card) => (card.id === change.id ? change : card)) : [...board.cards, change];
  return { seq: delta.seq, cards };
}

/**
 * Deltas in, boards out. It subscribes to the deltas before it loads the snapshot, so nothing sent in between is lost;
 * deltas that arrive during a load wait, and run in sequence order once the snapshot is in. A gap starts one reload.
 */
export function sequenced(load: () => Promise<BoardSnapshot>): OperatorFunction<BoardDelta, BoardSnapshot> {
  return (deltas$) =>
    new Observable<BoardSnapshot>((subscriber) => {
      let board: BoardSnapshot | undefined; // undefined while a snapshot loads
      let waiting: BoardDelta[] = [];

      const apply = (delta: BoardDelta): void => {
        if (board === undefined) {
          waiting.push(delta);
          return;
        }
        const next = advance(board, delta);
        if (next === 'gap') {
          waiting.push(delta);
          reload();
        } else if (next !== board) {
          board = next;
          subscriber.next(board);
        }
      };

      const reload = (): void => {
        board = undefined;
        load().then((snapshot) => {
          if (subscriber.closed) return;
          board = snapshot;
          subscriber.next(board);
          const queued = waiting.sort((a, b) => a.seq - b.seq);
          waiting = [];
          for (const delta of queued) apply(delta);
        }, (error: unknown) => subscriber.error(error));
      };

      const subscription = deltas$.subscribe({
        next: apply,
        error: (error: unknown) => subscriber.error(error),
        complete: () => subscriber.complete(),
      });
      reload();
      return subscription;
    });
}

/** One socket for every reader, closed `graceMs` after the last reader leaves; at most one board per window. */
@Injectable({ providedIn: 'root' })
export class BoardConnection {
  private readonly source = inject(BOARD_SOURCE);
  private readonly options = inject(BOARD_OPTIONS);

  readonly state = this.source.state;
  readonly board$ = this.source.deltas$.pipe(
    sequenced(() => this.source.snapshot()),
    auditTime(this.options.windowMs),
    share({ resetOnRefCountZero: () => timer(this.options.graceMs) }),
  );
}

/** Both variants render the same markup from `state` and `cards`. */
export const BOARD_TEMPLATE = `
  <p class="state">{{ state() }}</p>
  <ul>
    @for (card of cards(); track card.id) {
      <li>{{ card.column }}: {{ card.title }}</li>
    }
  </ul>
`;
