// Exercise 42.3, variant a: a signals store that the app initializer awaits, so routing starts with a known session.
import { HttpClient } from '@angular/common/http';
import {
  type EnvironmentProviders,
  Injectable,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
  signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { isUnauthorized } from '../../concepts/auth-session';
import { ME_URL, SIGNED_OUT, Session, type SessionState, type SessionUser, UNKNOWN, expect401 } from '../session';

@Injectable({ providedIn: 'root' })
export class SessionStore extends Session {
  private readonly http = inject(HttpClient);
  private readonly current = signal<SessionState>(UNKNOWN);
  private loading: Promise<void> | undefined;

  override readonly state = this.current.asReadonly();

  /** Asks /api/me once; the initializer, the guards and every later caller share one promise. */
  override whenKnown(): Promise<void> {
    this.loading ??= this.load();
    return this.loading;
  }

  protected override markSignedOut(): void {
    this.current.set(SIGNED_OUT);
  }

  /** A 401 is the answer "signed out"; any other failure rejects, and the app does not start. */
  private async load(): Promise<void> {
    try {
      const user = await firstValueFrom(this.http.get<SessionUser>(ME_URL, { context: expect401() }));
      this.current.set({ status: 'signed-in', user });
    } catch (error: unknown) {
      if (!isUnauthorized(error)) throw error;
      this.current.set(SIGNED_OUT);
      return;
    }
    await firstValueFrom(this.csrf.refresh());
  }
}

export function provideSessionStore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: Session, useExisting: SessionStore },
    provideAppInitializer(() => inject(SessionStore).whenKnown()),
  ]);
}
