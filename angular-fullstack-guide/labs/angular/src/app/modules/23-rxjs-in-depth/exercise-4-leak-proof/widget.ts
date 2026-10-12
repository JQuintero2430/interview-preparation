import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Observable, Subject, shareReplay, switchMap } from 'rxjs';
import { WIDGET_SOURCES } from './legacy/leaky-widget';

const TEMPLATE = `<p>{{ price() }}</p><p>{{ detail() }}</p><p>{{ clock() }}</p>`;

/** The leak-proof widget: signals for what the template reads, `takeUntilDestroyed` last for the one code-side pipe. */
@Component({ selector: 'lab-m23-widget', template: TEMPLATE })
export class Widget {
  protected readonly sources = inject(WIDGET_SOURCES);
  readonly #selected = new Subject<number>();
  protected readonly price = toSignal(this.sources.price$);
  protected readonly detail = signal('');
  protected readonly clock = toSignal(this.clockSource());

  constructor() {
    this.#selected
      .pipe(
        switchMap((id) => this.sources.detail$(id)),
        takeUntilDestroyed(),
      )
      .subscribe((detail) => this.detail.set(detail));
  }

  select(id: number): void {
    this.#selected.next(id);
  }

  protected clockSource(): Observable<number> {
    return this.sources.tick$;
  }
}

/** The alternative: the clock stays shared, and `refCount: true` lets the last reader stop it. */
@Component({ selector: 'lab-m23-refcount-widget', template: TEMPLATE })
export class RefCountWidget extends Widget {
  protected override clockSource(): Observable<number> {
    return this.sources.tick$.pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }
}
