import { InjectionToken } from '@angular/core';

/** The port for time: the store asks for the current time, never `Date.now()` directly. */
export interface Clock {
  now(): number;
}

export const CLOCK = new InjectionToken<Clock>('lab-m29-clock', {
  providedIn: 'root',
  factory: () => ({ now: () => Date.now() }),
});
