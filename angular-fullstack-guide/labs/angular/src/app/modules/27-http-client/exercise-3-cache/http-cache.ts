import { HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, finalize, of, shareReplay, tap } from 'rxjs';

/** The clock the cache reads, in milliseconds; a test replaces it, so no test waits for real time. */
export const CACHE_CLOCK = new InjectionToken<() => number>('CACHE_CLOCK', {
  providedIn: 'root',
  factory: () => () => Date.now(),
});

interface Entry {
  /** `Infinity` while the request is in flight, then the clock reading at which the entry stops being served. */
  expiresAt: number;
  /** One subscription to the backend, replayed to every caller of this entry. */
  readonly response$: Observable<HttpEvent<unknown>>;
}

@Injectable({ providedIn: 'root' })
export class HttpCache {
  private readonly clock = inject(CACHE_CLOCK);
  private readonly entries = new Map<string, Entry>();

  /** Serves a live entry, in flight or fresh; otherwise calls `load` once and keeps a 200 response for `ttlMs`. */
  lookup(key: string, load: () => Observable<HttpEvent<unknown>>, ttlMs: number): Observable<HttpEvent<unknown>> {
    const live = this.entries.get(key);
    if (live && this.clock() < live.expiresAt) return live.response$;

    const entry: Entry = {
      expiresAt: Infinity,
      response$: load().pipe(
        tap({
          next: (event) => {
            if (!(event instanceof HttpResponse)) return;
            if (event.status === 200) entry.expiresAt = this.clock() + ttlMs;
            else this.drop(key, entry);
          },
          error: () => this.drop(key, entry),
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      ),
    };
    this.entries.set(key, entry);
    return entry.response$;
  }

  /** Drops every entry whose key starts with `prefix`, in flight or not. */
  invalidate(prefix: string): void {
    for (const key of [...this.entries.keys()]) {
      if (key.startsWith(prefix)) this.entries.delete(key);
    }
  }

  private drop(key: string, entry: Entry): void {
    if (this.entries.get(key) === entry) this.entries.delete(key);
  }
}

interface Stored {
  readonly response: HttpResponse<unknown>;
  readonly expiresAt: number;
}

/** The alternative: responses and in-flight calls live in two maps, which every path must keep in step. */
@Injectable({ providedIn: 'root' })
export class TwoMapHttpCache implements Pick<HttpCache, keyof HttpCache> {
  private readonly clock = inject(CACHE_CLOCK);
  private readonly responses = new Map<string, Stored>();
  private readonly pending = new Map<string, Observable<HttpEvent<unknown>>>();

  lookup(key: string, load: () => Observable<HttpEvent<unknown>>, ttlMs: number): Observable<HttpEvent<unknown>> {
    const stored = this.responses.get(key);
    if (stored && this.clock() < stored.expiresAt) return of(stored.response);
    const inFlight = this.pending.get(key);
    if (inFlight) return inFlight;

    const request$: Observable<HttpEvent<unknown>> = load().pipe(
      tap((event) => {
        // A call that `invalidate` dropped while in flight must not store its response.
        if (event instanceof HttpResponse && event.status === 200 && this.pending.get(key) === request$) {
          this.responses.set(key, { response: event, expiresAt: this.clock() + ttlMs });
        }
      }),
      finalize(() => {
        if (this.pending.get(key) === request$) this.pending.delete(key);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.pending.set(key, request$);
    return request$;
  }

  /** Drops the stored responses and the in-flight calls whose key starts with `prefix`. */
  invalidate(prefix: string): void {
    dropByPrefix(this.responses, prefix);
    dropByPrefix(this.pending, prefix);
  }
}

function dropByPrefix(map: Map<string, unknown>, prefix: string): void {
  for (const key of [...map.keys()]) {
    if (key.startsWith(prefix)) map.delete(key);
  }
}
