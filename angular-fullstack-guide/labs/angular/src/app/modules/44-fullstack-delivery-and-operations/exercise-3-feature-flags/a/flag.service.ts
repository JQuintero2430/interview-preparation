// Exercise 44.3, variant a (the solution): a signals service. Each flag is a `computed` over the context and a
// per-key version; a new context or a changed key marks it dirty, and it re-evaluates once, when it is next read.
import { Injectable, type Signal, type WritableSignal, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  type EvaluationContext,
  FLAG_PROVIDER,
  type FlagReader,
  type ResolutionDetails,
  evaluateBoolean,
} from '../flags';

@Injectable({ providedIn: 'root' })
export class FlagService implements FlagReader {
  private readonly provider = inject(FLAG_PROVIDER);
  private readonly context = signal<EvaluationContext>({});
  private readonly versions = new Map<string, WritableSignal<number>>();

  constructor() {
    this.provider.changes$
      .pipe(takeUntilDestroyed())
      .subscribe((keys) => keys.forEach((key) => this.versionOf(key).update((version) => version + 1)));
  }

  details(key: string, defaultValue: boolean): Signal<ResolutionDetails<boolean>> {
    const version = this.versionOf(key);
    return computed(() => {
      version();
      return evaluateBoolean(this.provider, key, defaultValue, this.context());
    });
  }

  flag(key: string, defaultValue: boolean): Signal<boolean> {
    const details = this.details(key, defaultValue);
    return computed(() => details().value);
  }

  /** After login: one user, one context for the whole app (the static-context paradigm). */
  setContext(context: EvaluationContext): void {
    this.context.set(context);
  }

  private versionOf(key: string): WritableSignal<number> {
    const existing = this.versions.get(key);
    if (existing !== undefined) return existing;
    const created = signal(0);
    this.versions.set(key, created);
    return created;
  }
}
