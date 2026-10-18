import { Injectable, LOCALE_ID, inject } from '@angular/core';
import { toMs, toRelativeParts } from './relative-parts';

/** The same formatting as a root service: a component calls it inside a `computed`, and a test needs no template. */
@Injectable({ providedIn: 'root' })
export class LabM34RelativeTimeService {
  private readonly formatter = new Intl.RelativeTimeFormat(inject(LOCALE_ID), { numeric: 'auto' });

  /** Formats `value` relative to `now`, in the injector's locale. */
  format(value: Date | number, now: Date | number): string {
    const { value: amount, unit } = toRelativeParts(toMs(value) - toMs(now));
    return this.formatter.format(amount, unit);
  }
}
