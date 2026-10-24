// Section 3 model: the browser half of two RFC 10017 §6 architectures. Our model, not Spring's code.
// A backend-for-frontend (§6.1) keeps every token, so the page calls relative /api URLs and starts login by
// navigating the whole page to /oauth2/authorization/{registrationId}, the base URI Spring Security 7.1.1 sets in
// DefaultOAuth2AuthorizationRequestResolver (facts F8, C5). A token-mediating backend (§6.2) hands the page an
// access token, which the page attaches itself. Every server answer in the tests is our stub.
import { HttpClient } from '@angular/common/http';
import { DOCUMENT, Injectable, InjectionToken, inject, signal } from '@angular/core';
import { type Observable, firstValueFrom } from 'rxjs';

/** A full-page navigation, injected so that a test records it instead of leaving the page. */
export const LAB_M42_NAVIGATE = new InjectionToken<(url: string) => void>('LAB_M42_NAVIGATE', {
  providedIn: 'root',
  factory: () => {
    const location = inject(DOCUMENT).location;
    return (url: string) => location.assign(url);
  },
});

/** Our BFF's registration id: the `{registrationId}` segment of Spring's login URL. */
export const LAB_M42_REGISTRATION_ID = 'idp';

export interface LabM42User {
  readonly name: string;
}

/** BFF: the browser holds only the session cookie, which it sends to its own origin by itself. */
@Injectable({ providedIn: 'root' })
export class LabM42BffClient {
  private readonly http = inject(HttpClient);
  private readonly navigate = inject(LAB_M42_NAVIGATE);

  me(): Observable<LabM42User> {
    return this.http.get<LabM42User>('/api/me');
  }

  orders(): Observable<readonly string[]> {
    return this.http.get<readonly string[]>('/api/orders');
  }

  login(): void {
    this.navigate(`/oauth2/authorization/${LAB_M42_REGISTRATION_ID}`);
  }
}

/** Token-mediating backend: its session endpoint answers with an access token for the page to send. */
@Injectable({ providedIn: 'root' })
export class LabM42TokenMediatedClient {
  private readonly http = inject(HttpClient);
  private readonly accessToken = signal<string | null>(null);

  async resumeSession(): Promise<void> {
    const session = await firstValueFrom(this.http.get<{ readonly accessToken: string }>('/bff/session'));
    this.accessToken.set(session.accessToken);
  }

  orders(): Observable<readonly string[]> {
    const token = this.accessToken();
    const headers: Record<string, string> = token === null ? {} : { Authorization: `Bearer ${token}` };
    return this.http.get<readonly string[]>('https://api.example.com/orders', { headers });
  }
}
