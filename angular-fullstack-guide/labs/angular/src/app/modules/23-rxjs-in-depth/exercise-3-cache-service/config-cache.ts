import { Injectable, InjectionToken, inject } from '@angular/core';
import { BehaviorSubject, MonoTypeOperatorFunction, Observable, share, ReplaySubject, shareReplay, switchMap } from 'rxjs';

export interface AppConfig {
  version: number;
}

/** The loader the cache calls; the spec provides a counting fake. */
export const CONFIG_LOADER = new InjectionToken<Observable<AppConfig>>('lab-m23-config-loader');

@Injectable()
export class ConfigCache {
  readonly #reload = new BehaviorSubject<void>(undefined);
  readonly #load$ = inject(CONFIG_LOADER);

  /** Loads once, replays the last config to later subscribers, forgets a failed load. */
  readonly config$: Observable<AppConfig> = this.#reload.pipe(
    switchMap(() => this.#load$),
    this.keep(),
  );

  /** Loads again; every current subscriber receives the new value, and so does the next one. */
  refresh(): void {
    this.#reload.next();
  }

  protected keep(): MonoTypeOperatorFunction<AppConfig> {
    return shareReplay(1);
  }
}

/** The alternative: the same three rules, written out with `share`. */
@Injectable()
export class ShareConfigCache extends ConfigCache {
  protected override keep(): MonoTypeOperatorFunction<AppConfig> {
    return share({
      connector: () => new ReplaySubject(1),
      resetOnError: true,
      resetOnComplete: false,
      resetOnRefCountZero: false,
    });
  }
}
