import { DestroyRef, Injectable, InjectionToken, computed, inject, signal } from '@angular/core';
import type { Subscription } from 'rxjs';
import type { Problem } from '../concepts/problem-details';
import { ContractError, type ListQuery, type ListSource, httpProblem } from './list-source';
import type { Order } from './order.schema';

/** The pagination contract behind the list: variant a or variant b. */
export const ORDER_SOURCE = new InjectionToken<ListSource<Order>>('ORDER_SOURCE');

const FIRST_QUERY: ListQuery = { size: 20, sort: [{ property: 'id', direction: 'desc' }], filters: {} };

/** Signal state for an orders list over any `ListSource`; two injected dependencies. */
@Injectable()
export class OrderListStore {
  private readonly source = inject(ORDER_SOURCE);
  private inFlight: Subscription | undefined;
  private readonly position = signal<string | null>(null);
  private readonly queryState = signal<ListQuery>(FIRST_QUERY);
  private readonly itemsState = signal<readonly Order[]>([]);
  private readonly errorState = signal<Problem | null>(null);

  readonly query = this.queryState.asReadonly();
  readonly items = this.itemsState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly hasMore = computed(() => this.position() !== null);
  /** Rows whose id is already on screen: what an offset list repeats after an insert. */
  readonly duplicates = computed(() => this.items().length - new Set(this.items().map((order) => order.id)).size);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.inFlight?.unsubscribe());
  }

  /** Loads the first page again, replacing what is shown. */
  load(): void {
    this.fetch(null, []);
  }

  loadMore(): void {
    this.fetch(this.position(), this.items());
  }

  /** A new sort or filter changes every page, so the list restarts from the first one. */
  setQuery(change: Partial<ListQuery>): void {
    this.queryState.update((query) => ({ ...query, ...change }));
    this.load();
  }

  /** One request at a time: unsubscribing cancels the page still in flight. */
  private fetch(position: string | null, kept: readonly Order[]): void {
    this.inFlight?.unsubscribe();
    this.errorState.set(null);
    this.inFlight = this.source.page(this.query(), position).subscribe({
      next: (page) => {
        this.itemsState.set([...kept, ...page.items]);
        this.position.set(page.next);
      },
      error: (err: unknown) => this.fail(err),
    });
  }

  private fail(err: unknown): void {
    if (err instanceof ContractError) this.errorState.set(err.problem);
    else void httpProblem(err).then((problem) => this.errorState.set(problem));
  }
}
