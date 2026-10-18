import { LOCALE_ID, Pipe, type PipeTransform, inject } from '@angular/core';
import { toMs, toRelativeParts } from './relative-parts';

// One formatter per locale for the whole module: a formatter is built from a locale and options, then reused.
const formatters = new Map<string, Intl.RelativeTimeFormat>();

function formatterFor(locale: string): Intl.RelativeTimeFormat {
  let formatter = formatters.get(locale);
  if (formatter === undefined) {
    formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    formatters.set(locale, formatter);
  }
  return formatter;
}

/** Pure on purpose: the caller passes `now`, so a changing clock never needs an impure pipe. */
@Pipe({ name: 'labM34RelativeTime' })
export class LabM34RelativeTimePipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(value: Date | number, now: Date | number): string {
    const { value: amount, unit } = toRelativeParts(toMs(value) - toMs(now));
    return formatterFor(this.locale).format(amount, unit);
  }
}
