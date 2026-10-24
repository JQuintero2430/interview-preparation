// Section 6 model: the client half of Spring Security 7.1.1's csrf.spa() (facts F3, F16, C2). Our model, not Spring's code.
// Spring clears XSRF-TOKEN when sign-in succeeds (CsrfAuthenticationStrategy) and on logout (CsrfLogoutHandler), and the
// reference says to fetch a fresh token after both. Under spa() every request through CsrfFilter writes a missing
// cookie, so our GET /api/csrf only has to reach it. Angular's XSRF interceptor copies the cookie into X-XSRF-TOKEN.
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, switchMap } from 'rxjs';

export interface LabM42Credentials {
  readonly username: string;
  readonly password: string;
}

@Injectable({ providedIn: 'root' })
export class LabM42CsrfSession {
  private readonly http = inject(HttpClient);

  /** Our endpoint answers 204; the token arrives in its Set-Cookie header, never in the body. */
  refresh(): Observable<unknown> {
    return this.http.get('/api/csrf');
  }

  /** Spring's form login (POST /login with username and password); the body is read as text and ignored. */
  login(credentials: LabM42Credentials): Observable<unknown> {
    const body = new HttpParams({ fromObject: { username: credentials.username, password: credentials.password } });
    return this.http.post('/login', body, { responseType: 'text' }).pipe(switchMap(() => this.refresh()));
  }

  /** POST /logout needs the token too; afterwards no cookie exists until the next request sets one. */
  logout(): Observable<unknown> {
    return this.http.post('/logout', null, { responseType: 'text' }).pipe(switchMap(() => this.refresh()));
  }
}
