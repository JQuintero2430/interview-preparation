// Exercise 22.5: cold fake sources that count how often they start and how often they are torn down.
import { Observable, interval, map, timer } from 'rxjs';
import { DashboardSources, Order } from './dashboard-feed';

export const TICK_MS = 1000;

/** Wraps a cold source and counts its subscriptions (starts) and teardowns. */
export class Counted<T> {
  starts = 0;
  teardowns = 0;
  readonly source: Observable<T>;

  constructor(inner: Observable<T>) {
    this.source = new Observable<T>((subscriber) => {
      this.starts++;
      const upstream = inner.subscribe({
        next: (value) => subscriber.next(value),
        error: (err: unknown) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
      return () => {
        this.teardowns++;
        upstream.unsubscribe();
      };
    });
  }
}

/** A loader that answers `value` after `delayMs`, then completes. */
export function loader<T>(value: T, delayMs: number): Counted<T> {
  return new Counted(timer(delayMs).pipe(map(() => value)));
}

/** A loader that fails after `delayMs`. */
export function failingLoader(message: string, delayMs: number): Counted<never> {
  return new Counted(
    timer(delayMs).pipe(
      map((): never => {
        throw new Error(message);
      }),
    ),
  );
}

export interface FakeSources {
  readonly sources: DashboardSources;
  readonly users: Counted<readonly string[]>;
  readonly orders: Counted<readonly Order[]>;
  readonly alerts: Counted<readonly string[]>;
  readonly ticker: Counted<number>;
}

/** Users at 100 ms, orders at 200 ms, alerts at 300 ms (or a failure at 150 ms), a tick every second. */
export function createFakeSources(options: { failAlerts?: boolean } = {}): FakeSources {
  const users = loader<readonly string[]>(['ana', 'bo'], 100);
  const orders = loader<readonly Order[]>([{ id: 1, open: true }, { id: 2, open: false }, { id: 3, open: true }], 200);
  const alerts = options.failAlerts ? failingLoader('alerts down', 150) : loader<readonly string[]>(['disk'], 300);
  const ticker = new Counted(interval(TICK_MS));
  const sources = { users$: users.source, orders$: orders.source, alerts$: alerts.source, ticker$: ticker.source };
  return { sources, users, orders, alerts, ticker };
}
