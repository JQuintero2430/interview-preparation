// Exercise 42.3, variant b: the session as an httpResource. Startup does not wait; the guards wait for the answer.
import { httpResource } from '@angular/common/http';
import {
  type EnvironmentProviders,
  Injectable,
  computed,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom } from 'rxjs';
import { ME_URL, SIGNED_OUT, Session, type SessionState, type SessionUser, UNKNOWN, expect401 } from '../session';

@Injectable({ providedIn: 'root' })
export class SessionResource extends Session {
  private readonly me = httpResource<SessionUser>(() => ({ url: ME_URL, context: expect401() }));

  /** Any failure shows the login entry; `set(undefined)` (status `local`) is how a 401 or a tab signs out. */
  override readonly state = computed<SessionState>(() => {
    const status = this.me.status();
    if (status === 'error') return SIGNED_OUT;
    if (status !== 'resolved' && status !== 'local') return UNKNOWN;
    const user = this.me.value();
    return user === undefined ? SIGNED_OUT : { status: 'signed-in', user };
  });

  private readonly changes = toObservable(this.state);
  private readonly known = this.settle();

  override whenKnown(): Promise<void> {
    return this.known;
  }

  protected override markSignedOut(): void {
    this.me.set(undefined);
  }

  private async settle(): Promise<void> {
    const first = await firstValueFrom(this.changes.pipe(filter((state) => state.status !== 'unknown')));
    if (first.status === 'signed-in') await firstValueFrom(this.csrf.refresh());
  }
}

export function provideSessionResource(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: Session, useExisting: SessionResource },
    // Creates the resource at startup without waiting: it sends /api/me on the next change detection.
    provideAppInitializer(() => {
      inject(SessionResource);
    }),
  ]);
}
