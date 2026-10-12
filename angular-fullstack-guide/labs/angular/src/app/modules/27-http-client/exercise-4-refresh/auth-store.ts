import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, defer, finalize, map, share, shareReplay, tap, throwError } from 'rxjs';

/** Set to `true` in a request's context so the auth interceptor passes it through untouched. */
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

/** The access token and the single-flight refresh. Where a token is stored is module 33's, so it lives in memory here. */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly http = inject(HttpClient);
  readonly accessToken = signal('');
  /** How many refresh requests were started; the spec reads it. */
  readonly refreshCalls = signal(0);
  private inFlight: Observable<string> | null = null;

  /** Callers that overlap share one refresh; the field is cleared when it ends, so a later 401 can start another. */
  refresh(): Observable<string> {
    this.inFlight ??= this.requestToken().pipe(
      finalize(() => (this.inFlight = null)),
      shareReplay(1),
    );
    return this.inFlight;
  }

  logout(): void {
    this.accessToken.set('');
  }

  /** One refresh request, cold: it stores the new token, or logs out and passes the error on. */
  protected requestToken(): Observable<string> {
    return defer(() => {
      this.refreshCalls.update((count) => count + 1);
      return this.http.post<{ token: string }>('/auth/refresh', null, {
        context: new HttpContext().set(SKIP_AUTH, true),
      });
    }).pipe(
      map((response) => response.token),
      tap((token) => this.accessToken.set(token)),
      catchError((error: unknown) => {
        this.logout();
        return throwError(() => error);
      }),
    );
  }
}

/** The alternative: `share()` resets itself on completion and on error, so there is no field and no `finalize`. */
@Injectable()
export class ShareAuthStore extends AuthStore {
  private readonly shared$ = this.requestToken().pipe(share());

  override refresh(): Observable<string> {
    return this.shared$;
  }
}
