import { inject, Injectable, MAX_ANIMATION_TIMEOUT, type Provider } from '@angular/core';

/** Counts how often an injector built the short-timeout route's MAX_ANIMATION_TIMEOUT value. */
@Injectable({ providedIn: 'root' })
export class LabM35TimeoutReads {
  count = 0;
}

/** The value the short-timeout route provides; the factory records that something asked for it. */
export function shortAnimationTimeout(): number {
  inject(LabM35TimeoutReads).count += 1;
  return 300;
}

/** The short-timeout route's providers: a route-level MAX_ANIMATION_TIMEOUT. */
export const SHORT_TIMEOUT_PROVIDERS: Provider[] = [
  { provide: MAX_ANIMATION_TIMEOUT, useFactory: shortAnimationTimeout },
];
