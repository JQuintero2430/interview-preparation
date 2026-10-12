import { InjectionToken } from '@angular/core';
import { Observable, of } from 'rxjs';

/**
 * Whether the page is visible, as an injectable stream. A real page would adapt `document.visibilityState`
 * here; the lab default is "always visible" and the spec provides a `BehaviorSubject<boolean>` it drives by hand.
 */
export const VISIBILITY = new InjectionToken<Observable<boolean>>('lab-m23-visibility', {
  factory: () => of(true),
});
