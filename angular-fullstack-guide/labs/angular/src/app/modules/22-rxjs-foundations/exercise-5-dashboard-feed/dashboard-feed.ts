// Exercise 22.5: a dashboard feed assembled from operators only. It exposes no Subject and calls no subscribe:
// whoever subscribes to its streams starts (and, by unsubscribing, stops) the work.
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, combineLatest, forkJoin, map, share, startWith, withLatestFrom } from 'rxjs';

export interface Order {
  readonly id: number;
  readonly open: boolean;
}
export type OrderFilter = 'all' | 'open';

export interface DashboardSources {
  readonly users$: Observable<readonly string[]>;
  readonly orders$: Observable<readonly Order[]>;
  readonly alerts$: Observable<readonly string[]>;
  readonly ticker$: Observable<number>;
}
export const DASHBOARD_SOURCES = new InjectionToken<DashboardSources>('lab-m22-dashboard-sources');

export interface Snapshot {
  readonly users: readonly string[];
  readonly orders: readonly Order[];
  readonly alerts: readonly string[];
}
export interface DashboardView {
  readonly filter: OrderFilter;
  readonly users: number;
  readonly orders: number;
  readonly alerts: number;
  readonly tick: number;
}

function toView(filter: OrderFilter, snapshot: Snapshot, tick: number): DashboardView {
  const orders = filter === 'open' ? snapshot.orders.filter((order) => order.open) : snapshot.orders;
  return { filter, users: snapshot.users.length, orders: orders.length, alerts: snapshot.alerts.length, tick };
}

@Injectable()
export class DashboardFeed {
  private readonly sources = inject(DASHBOARD_SOURCES);
  /** One ticker run for every current subscriber; it stops when the last one leaves. */
  private readonly tick$ = this.sources.ticker$.pipe(share());

  /** Cold: each subscription starts the three loaders and gets one snapshot when all of them complete. */
  readonly snapshot$: Observable<Snapshot> = forkJoin({
    users: this.sources.users$,
    orders: this.sources.orders$,
    alerts: this.sources.alerts$,
  });

  /** The latest filter (default 'all'), the snapshot and the ticker, once each has a value. */
  live(filter$: Observable<OrderFilter>): Observable<DashboardView> {
    return combineLatest([filter$.pipe(startWith<OrderFilter>('all')), this.snapshot$, this.tick$]).pipe(
      map(([filter, snapshot, tick]) => toView(filter, snapshot, tick)),
    );
  }

  /** Each click paired with the latest tick; ticks alone emit nothing. */
  stamp<T>(click$: Observable<T>): Observable<[T, number]> {
    return click$.pipe(withLatestFrom(this.tick$));
  }
}
