import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';

/** The variant's API prefix (`/api/m33/ex4/a/` or `/b/`). Given by the route. */
export const LAB_M33_EX4_API = new InjectionToken<string>('LAB_M33_EX4_API');

/** Where the page stands: asking the server at start-up, signed in, or signed out. */
export type LabM33Ex4Session = 'checking' | 'signed-in' | 'signed-out';

/** What sign-in and restore answer: variant a's server puts an access token in the body, variant b's sends no body. */
export interface LabM33Ex4Grant {
  accessToken?: string;
}

/**
 * Exercise 33.4: the session as signals. The steps are shared (template method); each variant says where its
 * session is restored and ended, and what, if anything, it keeps in the page.
 */
export abstract class LabM33Ex4Auth {
  protected readonly http = inject(HttpClient);
  protected readonly api = inject(LAB_M33_EX4_API);
  private readonly state = signal<LabM33Ex4Session>('checking');
  readonly session = this.state.asReadonly();

  /** The route that restores the session and, with `DELETE`, ends it. */
  protected abstract readonly sessionRoute: string;
  protected abstract restoreRequest(): Observable<LabM33Ex4Grant | null>;
  protected abstract keep(grant: LabM33Ex4Grant | null): void;
  protected abstract forget(): void;

  /** Signs in (the lab's login takes no password: forms and OAuth flows are module 42's). */
  login(): void {
    this.start(this.http.post<LabM33Ex4Grant | null>(`${this.api}login`, null));
  }

  /** At start-up: asks the server whether a session survived the reload. */
  restore(): void {
    this.start(this.restoreRequest());
  }

  /** Ends the session on the server, and in the page whatever the server answers. */
  logout(): void {
    this.http.delete(`${this.api}${this.sessionRoute}`).subscribe({ next: () => this.end(), error: () => this.end() });
  }

  private start(request: Observable<LabM33Ex4Grant | null>): void {
    request.subscribe({
      next: (grant) => {
        this.keep(grant);
        this.state.set('signed-in');
      },
      error: () => this.end(),
    });
  }

  private end(): void {
    this.forget();
    this.state.set('signed-out');
  }
}

/** Solution: the access token lives in a signal; the refresh token in an HttpOnly cookie only `refresh` receives. */
@Injectable()
export class LabM33Ex4MemoryAuth extends LabM33Ex4Auth {
  private readonly token = signal<string | null>(null);
  /** Read by the bearer interceptor. */
  readonly accessToken = this.token.asReadonly();
  protected readonly sessionRoute = 'refresh';

  protected restoreRequest(): Observable<LabM33Ex4Grant | null> {
    return this.http.post<LabM33Ex4Grant | null>(`${this.api}refresh`, null);
  }

  protected keep(grant: LabM33Ex4Grant | null): void {
    this.token.set(grant?.accessToken ?? null);
  }

  protected forget(): void {
    this.token.set(null);
  }
}

/** Alternative: a backend-for-frontend. The page keeps nothing; the browser holds the session cookie. */
@Injectable()
export class LabM33Ex4BffAuth extends LabM33Ex4Auth {
  protected readonly sessionRoute = 'session';

  protected restoreRequest(): Observable<LabM33Ex4Grant | null> {
    return this.http.get<LabM33Ex4Grant | null>(`${this.api}session`);
  }

  protected keep(): void {
    // Nothing to keep: the Set-Cookie header already did it.
  }

  protected forget(): void {
    // Nothing to drop: the server cleared the cookie.
  }
}
