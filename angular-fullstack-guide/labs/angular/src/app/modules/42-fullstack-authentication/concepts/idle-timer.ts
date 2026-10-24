// Section 8 model: the page's side of a session timeout. Our model, not Angular's or Spring's code.
// The server decides when a session ends: Spring Boot 4.1.1 defaults `server.servlet.session.timeout` to 30 minutes
// (Session.java, fact F2), counted between client requests (Jakarta Servlet 6.1.0 HttpSession.setMaxInactiveInterval).
// The page can only guess where that clock stands, so it restarts its own countdown whenever a response comes back,
// warns shortly before the guess runs out, and keeps a draft so that a 401 on submit loses nothing. Timers are
// setTimeout, which a test moves with Vitest fake timers; nothing here reads the clock.
import { HttpClient, type HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Injectable, InjectionToken, inject, signal } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';

export interface LabM42IdleOptions {
  readonly timeoutMs: number;
  readonly warnBeforeMs: number;
}

/** The default mirrors Boot's 30 minutes; the warning shows one minute before it. */
export const LAB_M42_IDLE_OPTIONS = new InjectionToken<LabM42IdleOptions>('LAB_M42_IDLE_OPTIONS', {
  providedIn: 'root',
  factory: () => ({ timeoutMs: 30 * 60_000, warnBeforeMs: 60_000 }),
});

export type LabM42IdlePhase = 'active' | 'warning' | 'expired';

@Injectable({ providedIn: 'root' })
export class LabM42IdleTimer {
  private readonly options = inject(LAB_M42_IDLE_OPTIONS);
  private readonly current = signal<LabM42IdlePhase>('active');
  private warnTimer: ReturnType<typeof setTimeout> | undefined;
  private expireTimer: ReturnType<typeof setTimeout> | undefined;

  readonly phase = this.current.asReadonly();

  /** Restarts the countdown. Call it when the server has seen a request: keystrokes never reach its clock. */
  restart(): void {
    this.stop();
    this.current.set('active');
    const { timeoutMs, warnBeforeMs } = this.options;
    this.warnTimer = setTimeout(() => this.current.set('warning'), timeoutMs - warnBeforeMs);
    this.expireTimer = setTimeout(() => this.current.set('expired'), timeoutMs);
  }

  stop(): void {
    clearTimeout(this.warnTimer);
    clearTimeout(this.expireTimer);
  }
}

/** Every successful response proves the server saw a request, so the countdown starts over; a 401 does not. */
export const restartIdleOnResponse: HttpInterceptorFn = (req, next) => {
  const timer = inject(LabM42IdleTimer);
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) timer.restart();
    }),
  );
};

/** The part of `sessionStorage` the drafts use, so that a test can pass a Map-backed fake. */
export interface LabM42DraftStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const LAB_M42_DRAFT_STORAGE = new InjectionToken<LabM42DraftStorage>('LAB_M42_DRAFT_STORAGE', {
  providedIn: 'root',
  factory: () => globalThis.sessionStorage,
});

@Injectable({ providedIn: 'root' })
export class LabM42DraftSubmit {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(LAB_M42_DRAFT_STORAGE);

  /** Saves the draft before sending, so a login redirect started by a 401 cannot lose it; the server's yes removes it. */
  async submit(key: string, url: string, draft: string): Promise<void> {
    this.storage.setItem(key, draft);
    await firstValueFrom(this.http.post(url, { draft }));
    this.storage.removeItem(key);
  }

  /** The draft left behind by a failed submit, or null when there is none. */
  restore(key: string): string | null {
    return this.storage.getItem(key);
  }
}
