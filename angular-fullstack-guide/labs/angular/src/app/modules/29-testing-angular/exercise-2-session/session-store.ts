import { Injectable, computed, inject, signal } from '@angular/core';
import { CLOCK } from './clock';
import { SESSION_STORAGE } from './session-storage';

export const SESSION_KEY = 'lab-m29-session';

interface StoredSession {
  readonly user: string;
  readonly expiresAt: number;
}

function isStoredSession(value: unknown): value is StoredSession {
  return (
    typeof value === 'object' &&
    value !== null &&
    'user' in value &&
    typeof value.user === 'string' &&
    'expiresAt' in value &&
    typeof value.expiresAt === 'number'
  );
}

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly clock = inject(CLOCK);
  private readonly storage = inject(SESSION_STORAGE);
  private readonly session = signal<StoredSession | null>(this.restore());
  private readonly checkedAt = signal(this.clock.now());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly expired = computed(() => {
    const session = this.session();
    return session !== null && this.checkedAt() >= session.expiresAt;
  });

  start(user: string, ttlMs: number): void {
    const now = this.clock.now();
    const session: StoredSession = { user, expiresAt: now + ttlMs };
    this.storage.setItem(SESSION_KEY, JSON.stringify(session));
    this.session.set(session);
    this.checkedAt.set(now);
  }

  /** Reads the clock again; `expired` only changes when this runs. */
  refresh(): void {
    this.checkedAt.set(this.clock.now());
  }

  remainingMs(): number {
    const session = this.session();
    return session === null ? 0 : Math.max(0, session.expiresAt - this.clock.now());
  }

  private restore(): StoredSession | null {
    const raw = this.storage.getItem(SESSION_KEY);
    if (raw === null) {
      return null;
    }
    try {
      const value: unknown = JSON.parse(raw);
      return isStoredSession(value) ? value : null;
    } catch {
      return null;
    }
  }
}
