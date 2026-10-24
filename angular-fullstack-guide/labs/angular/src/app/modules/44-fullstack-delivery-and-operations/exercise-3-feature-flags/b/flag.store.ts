// Exercise 44.3, variant b (the alternative): an Observable service, the shape `@openfeature/angular-sdk` 1.3.2's
// `FeatureFlagService` has (read 2026-10-22, not run), with the signal read through `toSignal`. Each subscription
// evaluates once at start, once per context and once per change that names its key.
import { Injectable, type Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, type Observable, combineLatest, filter, map, startWith } from 'rxjs';
import {
  type EvaluationContext,
  FLAG_PROVIDER,
  type FlagReader,
  type ResolutionDetails,
  evaluateBoolean,
} from '../flags';

@Injectable({ providedIn: 'root' })
export class FlagStore implements FlagReader {
  private readonly provider = inject(FLAG_PROVIDER);
  private readonly context$ = new BehaviorSubject<EvaluationContext>({});

  details$(key: string, defaultValue: boolean): Observable<ResolutionDetails<boolean>> {
    const changed$ = this.provider.changes$.pipe(
      filter((keys) => keys.includes(key)),
      startWith([key]),
    );
    return combineLatest([this.context$, changed$]).pipe(
      map(([context]) => evaluateBoolean(this.provider, key, defaultValue, context)),
    );
  }

  /** Must run in an injection context, as `toSignal` requires; the subscription ends with that context. */
  details(key: string, defaultValue: boolean): Signal<ResolutionDetails<boolean>> {
    return toSignal(this.details$(key, defaultValue), { requireSync: true });
  }

  flag(key: string, defaultValue: boolean): Signal<boolean> {
    const details = this.details(key, defaultValue);
    return computed(() => details().value);
  }

  setContext(context: EvaluationContext): void {
    this.context$.next(context);
  }
}
