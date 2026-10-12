import { Injectable, InjectionToken, computed, signal } from '@angular/core';

export type LabM24Role = 'guest' | 'user' | 'admin';

/** The signed-in user's role. Tests replace or drive it; real authentication is out of scope. */
@Injectable({ providedIn: 'root' })
export class LabM24Session {
  readonly role = signal<LabM24Role>('guest');
  readonly loggedIn = computed(() => this.role() !== 'guest');
}

/** The question the editor asks before leaving with unsaved changes. Tests replace it. */
export const LAB_M24_CONFIRM = new InjectionToken<(message: string) => boolean>('LAB_M24_CONFIRM', {
  providedIn: 'root',
  factory: () => (message) => window.confirm(message),
});
