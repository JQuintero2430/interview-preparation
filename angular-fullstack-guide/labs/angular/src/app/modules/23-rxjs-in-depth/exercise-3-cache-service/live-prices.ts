import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, share, timer } from 'rxjs';

/** How long the ticker keeps running after its last subscriber left. */
export const GRACE_MS = 2000;

/** The endless price source; the spec provides a counting fake. */
export const PRICE_SOURCE = new InjectionToken<Observable<number>>('lab-m23-price-source');

@Injectable()
export class LivePrices {
  /** One shared run; it stops `GRACE_MS` after the last subscriber left unless one returns first. */
  readonly prices$: Observable<number> = inject(PRICE_SOURCE).pipe(
    share({ resetOnRefCountZero: () => timer(GRACE_MS) }),
  );
}
