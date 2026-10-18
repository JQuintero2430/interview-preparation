import { InjectionToken } from '@angular/core';

/** The port for persistence: the two methods the store needs from `localStorage`. */
export interface SessionStoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const SESSION_STORAGE = new InjectionToken<SessionStoragePort>('lab-m29-session-storage', {
  providedIn: 'root',
  factory: () => localStorage,
});
