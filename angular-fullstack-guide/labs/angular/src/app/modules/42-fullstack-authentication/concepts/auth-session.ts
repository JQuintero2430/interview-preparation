// Section 7 model: the browser's view of a BFF session (RFC 10017 §6.1). Our model, not a library's code.
// The page cannot read the HttpOnly session cookie, so it asks our GET /api/me once, at startup: 200 means signed in,
// 401 means anonymous. Every answer in the tests is our stub; the check decides what the screens offer, never what
// the API allows.
import { HttpClient, HttpContext, HttpContextToken, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LAB_M42_NAVIGATE, LAB_M42_REGISTRATION_ID, type LabM42User } from './bff-client';

const LOGIN_URL = `/oauth2/authorization/${LAB_M42_REGISTRATION_ID}`;
const ME_URL = '/api/me';

export type LabM42AuthState =
  | { readonly status: 'unknown' }
  | { readonly status: 'anonymous' }
  | { readonly status: 'signed-in'; readonly user: LabM42User };

/** Marks a request whose 401 is an expected answer, so the 401 interceptor leaves it alone. */
export const LAB_M42_EXPECT_401 = new HttpContextToken<boolean>(() => false);

/** True when `error` is an HTTP error response with status 401; any other value is false. */
export function isUnauthorized(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 401;
}

@Injectable({ providedIn: 'root' })
export class LabM42AuthSession {
  private readonly http = inject(HttpClient);
  private readonly navigate = inject(LAB_M42_NAVIGATE);
  private readonly current = signal<LabM42AuthState>({ status: 'unknown' });
  private loginStarted = false;

  readonly state = this.current.asReadonly();
  readonly signedIn = computed(() => this.current().status === 'signed-in');

  /** The startup check: a 401 here is the answer "anonymous", any other failure stays an error. */
  async load(): Promise<void> {
    try {
      const context = new HttpContext().set(LAB_M42_EXPECT_401, true);
      const user = await firstValueFrom(this.http.get<LabM42User>(ME_URL, { context }));
      this.current.set({ status: 'signed-in', user });
    } catch (error: unknown) {
      if (!isUnauthorized(error)) throw error;
      this.current.set({ status: 'anonymous' });
    }
  }

  /** Leaves the page for the BFF's login URL, once; the flag is never reset because the page is gone. */
  startLogin(): void {
    if (this.loginStarted) return;
    this.loginStarted = true;
    this.navigate(LOGIN_URL);
  }
}
