// Exercise 42.3: the browser half of a BFF session (sections 3, 6, 7 and 8). Our model, not a library's code.
// The page cannot read the HttpOnly session cookie, so it asks our GET /api/me. Every server answer in the tests is our
// stub; the state decides which screens the app offers, never what the API allows.
import { HttpContext } from '@angular/common/http';
import { DOCUMENT, DestroyRef, InjectionToken, type Signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LAB_M42_EXPECT_401 } from '../concepts/auth-session';
import { LabM42CsrfSession } from '../concepts/csrf-session';

export const ME_URL = '/api/me';
/** Spring Security's login URL for our registration id `idp` (section 3). */
export const LOGIN_URL = '/oauth2/authorization/idp';

export interface SessionUser {
  readonly name: string;
}

export type SessionState =
  | { readonly status: 'unknown' }
  | { readonly status: 'signed-in'; readonly user: SessionUser }
  | { readonly status: 'signed-out' };

export const UNKNOWN: SessionState = { status: 'unknown' };
export const SIGNED_OUT: SessionState = { status: 'signed-out' };

/** The only message our tabs exchange: an event, never a token. */
export interface TabMessage {
  readonly type: 'logged-out';
}

export const LOGGED_OUT: TabMessage = { type: 'logged-out' };

/** What a session needs from the other tabs; production wraps a BroadcastChannel, tests use a fake. */
export interface TabChannel {
  post(message: TabMessage): void;
  onMessage(handler: (message: unknown) => void): void;
}

/** True only for our logout message; anything else posted on the channel is ignored. */
export function isLoggedOut(message: unknown): boolean {
  return typeof message === 'object' && message !== null && 'type' in message && message.type === LOGGED_OUT.type;
}

export const TAB_CHANNEL = new InjectionToken<TabChannel>('TAB_CHANNEL', {
  providedIn: 'root',
  factory: () => {
    const channel = new BroadcastChannel('lab-m42-session');
    inject(DestroyRef).onDestroy(() => channel.close());
    return {
      post: (message) => channel.postMessage(message),
      onMessage: (handler) => channel.addEventListener('message', (event) => handler(event.data)),
    };
  },
});

/** A full-page navigation, injected so that a test records it instead of leaving the page. */
export const LOGIN_NAVIGATION = new InjectionToken<(url: string) => void>('LOGIN_NAVIGATION', {
  providedIn: 'root',
  factory: () => {
    const location = inject(DOCUMENT).location;
    return (url: string) => location.assign(url);
  },
});

/** Marks the startup check: its 401 means "signed out", so the 401 interceptor leaves it alone. */
export function expect401(): HttpContext {
  return new HttpContext().set(LAB_M42_EXPECT_401, true);
}

/** The contract both variants implement; the guard and the interceptor see only this class. */
export abstract class Session {
  protected readonly csrf = inject(LabM42CsrfSession);
  private readonly channel = inject(TAB_CHANNEL);
  private readonly navigate = inject(LOGIN_NAVIGATION);

  abstract readonly state: Signal<SessionState>;

  /** Resolves once the startup check has answered and, when signed in, a fresh CSRF token has arrived. */
  abstract whenKnown(): Promise<void>;

  protected abstract markSignedOut(): void;

  constructor() {
    this.channel.onMessage((message) => {
      if (isLoggedOut(message)) this.markSignedOut();
    });
  }

  /** The first 401 of a signed-in session flips it and returns true; every later 401 finds it signed out. */
  expire(): boolean {
    if (this.state().status !== 'signed-in') return false;
    this.markSignedOut();
    return true;
  }

  /** The login page's button: leaves the page for the BFF, which runs the OAuth flow (section 3). */
  startLogin(): void {
    this.navigate(LOGIN_URL);
  }

  /** Ends the server session (POST /logout, then a fresh token, section 6), then tells the other tabs. */
  async signOut(): Promise<void> {
    await firstValueFrom(this.csrf.logout());
    this.markSignedOut();
    this.channel.post(LOGGED_OUT);
  }
}
