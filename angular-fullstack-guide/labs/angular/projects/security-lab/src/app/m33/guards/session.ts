import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

/** What `POST /api/m33/guards/login` answers (server/security/10-guards.mjs). */
interface LabM33GuardLogin {
  role: string;
}

const ROLE_KEY = 'm33-guards-role';

/**
 * Section 10: the session as the browser sees it. The server keeps the real role behind an `HttpOnly` cookie; this
 * service keeps a copy in `localStorage` so the router guard and the pages can decide what to show. The copy is a
 * convenience the user can edit, which is the point of the section.
 */
@Injectable({ providedIn: 'root' })
export class LabM33GuardSession {
  private readonly http = inject(HttpClient);

  role(): string {
    return localStorage.getItem(ROLE_KEY) ?? 'guest';
  }

  signIn(role: string): Observable<string> {
    return this.http.post<LabM33GuardLogin>(`/api/m33/guards/login?role=${role}`, null).pipe(
      map((session) => {
        localStorage.setItem(ROLE_KEY, session.role);
        return session.role;
      }),
    );
  }

  /** The admin API: the server checks the cookie's role, not this service's copy. */
  loadReport(): Observable<unknown> {
    return this.http.get('/api/m33/guards/report');
  }
}
