/** The 64-bit signed range of a Java `long`, as the bounds a `Long` ID must stay inside. */
const LONG_MIN = -(2n ** 63n);
const LONG_MAX = 2n ** 63n - 1n;

const INSTANT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DECIMAL_PATTERN = /^(-?)(\d+)(?:\.(\d+))?$/;

/** Days in a month of the proleptic Gregorian calendar, without a `Date`, so no zone can touch it. */
function daysInMonth(year: number, month: number): number {
  if (month === 2) return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function isCalendarDate(year: number, month: number, day: number): boolean {
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
}

/**
 * Reads an instant written as ISO 8601 with `Z` or an offset, such as Jackson 3 writes an `Instant` or an
 * `OffsetDateTime`, and returns epoch milliseconds. A text without an offset names no instant, so it throws, and so does
 * a date that does not exist (a `Date` would roll `2026-02-30` over to March). Digits below the millisecond are dropped.
 */
export function parseInstant(text: string): number {
  const match = INSTANT_PATTERN.exec(text);
  if (match === null) throw new SyntaxError(`Not an ISO 8601 instant with Z or an offset: "${text}"`);
  const [, year = '', month = '', day = '', hour = '', minute = '', second = '', fraction = '', zone = ''] = match;
  const offsetHours = zone === 'Z' ? 0 : Number(zone.slice(1, 3));
  const offsetMinutes = zone === 'Z' ? 0 : Number(zone.slice(4, 6));
  const valid =
    isCalendarDate(Number(year), Number(month), Number(day)) &&
    Number(hour) <= 23 && Number(minute) <= 59 && Number(second) <= 59 &&
    offsetHours <= 23 && offsetMinutes <= 59;
  if (!valid) throw new RangeError(`Not a real instant: "${text}"`);
  const millis = fraction.padEnd(3, '0').slice(0, 3);
  return Date.parse(`${year}-${month}-${day}T${hour}:${minute}:${second}.${millis}${zone}`);
}

/** A calendar date with no time and no zone, as Jackson 3 writes a `LocalDate`: the same three numbers everywhere. */
export interface LocalDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

/** Keeps a `YYYY-MM-DD` string as a date. It never builds a `Date` at midnight, so no zone can shift it; a date that does not exist throws. */
export function keepLocalDate(text: string): LocalDate {
  const match = DATE_PATTERN.exec(text);
  if (match === null) throw new SyntaxError(`Not a YYYY-MM-DD date: "${text}"`);
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (!isCalendarDate(year, month, day)) throw new RangeError(`Not a real date: "${text}"`);
  return { year, month, day };
}

/** Writes a kept date back as `YYYY-MM-DD`, the form the server reads. */
export function formatLocalDate({ year, month, day }: LocalDate): string {
  return [String(year).padStart(4, '0'), String(month).padStart(2, '0'), String(day).padStart(2, '0')].join('-');
}

/** Shows a kept date for a locale. The formatter runs in UTC on the same UTC fields, so the shown day is the stored day. */
export function displayLocalDate({ year, month, day }: LocalDate, locale: string): string {
  const atUtcNoon = new Date(Date.UTC(2000, month - 1, day, 12));
  atUtcNoon.setUTCFullYear(year);
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(atUtcNoon);
}

/**
 * Converts a plain decimal string such as `"19.90"` to a count of minor units, with `BigInt`, so the amount never
 * passes through a `number`. More fraction digits than the currency has throws, because rounding is a domain decision.
 */
export function decimalToMinor(text: string, fractionDigits: number): bigint {
  if (!Number.isInteger(fractionDigits) || fractionDigits < 0) throw new RangeError(`Bad digit count: ${fractionDigits}`);
  const match = DECIMAL_PATTERN.exec(text);
  if (match === null) throw new SyntaxError(`Not a plain decimal string: "${text}"`);
  const [, sign = '', whole = '0', fraction = ''] = match;
  if (fraction.length > fractionDigits) throw new RangeError(`"${text}" has more than ${fractionDigits} fraction digits`);
  const magnitude = BigInt(whole + fraction.padEnd(fractionDigits, '0'));
  return sign === '-' ? -magnitude : magnitude;
}

/** The reverse of `decimalToMinor`: minor units back to the plain decimal string a server parses into a `BigDecimal`. */
export function minorToDecimal(minor: bigint, fractionDigits: number): string {
  const digits = (minor < 0n ? -minor : minor).toString().padStart(fractionDigits + 1, '0');
  const cut = digits.length - fractionDigits;
  const text = fractionDigits === 0 ? digits : `${digits.slice(0, cut)}.${digits.slice(cut)}`;
  return minor < 0n ? `-${text}` : text;
}

/**
 * Reads a 64-bit ID from a decoded JSON value. A string keeps every digit. A number is accepted only while it is a
 * safe integer, because above 2^53 the digits were already lost inside `JSON.parse`.
 */
export function readLongId(value: unknown): string {
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) throw new RangeError(`The number ${value} lost digits in JSON.parse; send the ID as a string`);
    return String(value);
  }
  if (typeof value !== 'string' || !/^-?\d+$/.test(value)) throw new SyntaxError('An ID must be a string of digits');
  const id = BigInt(value);
  if (id < LONG_MIN || id > LONG_MAX) throw new RangeError(`"${value}" does not fit a 64-bit Long`);
  return id.toString();
}
