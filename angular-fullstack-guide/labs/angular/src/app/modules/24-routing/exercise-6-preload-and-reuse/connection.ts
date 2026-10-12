import { Injectable, signal } from '@angular/core';

/**
 * What a preloading decision may know about the network. The Network Information API (`navigator.connection`)
 * is missing from jsdom and from some browsers, so the app reads this service and a test overrides it.
 */
@Injectable({ providedIn: 'root' })
export class LabM24Connection {
  readonly saveData = signal(false);
  /** `'4g'`, `'3g'` or `'2g'`, the values of `NetworkInformation.effectiveType` this exercise uses. */
  readonly effectiveType = signal('4g');
}
