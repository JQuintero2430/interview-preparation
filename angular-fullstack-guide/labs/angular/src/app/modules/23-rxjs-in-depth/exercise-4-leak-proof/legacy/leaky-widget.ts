import { AsyncPipe } from '@angular/common';
import { Component, InjectionToken, OnDestroy, inject } from '@angular/core';
import { Observable, Subject, shareReplay, switchMap, takeUntil } from 'rxjs';

/** What the widget reads: an endless price feed, an endless clock and one endless detail stream per id. */
export interface WidgetSources {
  readonly price$: Observable<number>;
  readonly tick$: Observable<number>;
  detail$(id: number): Observable<string>;
}

export const WIDGET_SOURCES = new InjectionToken<WidgetSources>('lab-m23-widget-sources');

/**
 * LEGACY, given to the exercise and never edited: it leaks on purpose, three ways.
 * 1. The constructor subscribes to `price$` with a bare `subscribe`.
 * 2. `takeUntil(this.#destroy$)` comes before `switchMap`, so the open detail stream outlives the component.
 * 3. `shareReplay(1)` without `refCount` keeps the clock running after the last reader is gone.
 */
@Component({
  selector: 'lab-m23-leaky-widget',
  imports: [AsyncPipe],
  template: `<p>{{ price }}</p><p>{{ detail }}</p><p>{{ clock$ | async }}</p>`,
})
export class LeakyWidget implements OnDestroy {
  readonly #sources = inject(WIDGET_SOURCES);
  readonly #destroy$ = new Subject<void>();
  readonly #selected = new Subject<number>();
  protected price: number | undefined;
  protected detail = '';
  protected readonly clock$ = this.#sources.tick$.pipe(shareReplay(1));

  constructor() {
    this.#sources.price$.subscribe((price) => (this.price = price));
    this.#selected
      .pipe(
        takeUntil(this.#destroy$),
        switchMap((id) => this.#sources.detail$(id)),
      )
      .subscribe((detail) => (this.detail = detail));
  }

  select(id: number): void {
    this.#selected.next(id);
  }

  ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
  }
}
