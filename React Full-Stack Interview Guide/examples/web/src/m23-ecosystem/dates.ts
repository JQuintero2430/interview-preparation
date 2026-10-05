const DAY_MS = 86_400_000;

/** moment(d).format('ll') replacement. Fixed time zone so output is reproducible. */
export function formatShortDate(d: Date, locale = 'en-US', timeZone = 'UTC'): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone }).format(d);
}

/** moment(d).add(n, 'days') replacement, immutable. Pure UTC arithmetic (no DST shifts). */
export function addDaysUtc(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

/** moment(b).diff(a, 'days') replacement: whole days, truncated toward zero. */
export function diffInDays(a: Date, b: Date): number {
  return Math.trunc((b.getTime() - a.getTime()) / DAY_MS);
}

/** moment(x).isValid() replacement. */
export function isValidDate(d: Date): boolean {
  return !Number.isNaN(d.getTime());
}

/** moment(from).from(to) replacement using Intl.RelativeTimeFormat. */
export function relativeTime(from: Date, to: Date, locale = 'en'): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const seconds = Math.round((from.getTime() - to.getTime()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return rtf.format(seconds, 'second');
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
  if (abs < 86_400) return rtf.format(Math.round(seconds / 3600), 'hour');
  return rtf.format(Math.round(seconds / 86_400), 'day');
}
