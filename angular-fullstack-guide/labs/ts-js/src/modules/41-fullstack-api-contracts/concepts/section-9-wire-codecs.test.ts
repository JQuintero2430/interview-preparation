// Section 9 claims: an instant is one moment in any offset, a calendar date has no zone to shift it, a decimal string
// converts to minor units exactly, and a Long above 2^53 survives only as a string.
import { decimalToMinor, displayLocalDate, formatLocalDate, keepLocalDate, minorToDecimal, parseInstant, readLongId } from './wire-codecs';

const dayIn = (epochMillis: number, timeZone: string): string =>
  new Intl.DateTimeFormat('en-US', { day: 'numeric', timeZone }).format(new Date(epochMillis));

describe('Module 41 · section 9', () => {
  it('Section 9: an instant string gives the same epoch milliseconds whatever offset it is written in', () => {
    const utc = parseInstant('2026-10-21T03:30:00Z');
    expect(parseInstant('2026-10-20T23:30:00-04:00')).toBe(utc);
    expect(parseInstant('2026-10-21T05:30:00+02:00')).toBe(utc);
    expect(parseInstant('2026-10-21T03:30:00.123456789Z')).toBe(utc + 123);
    expect(dayIn(utc, 'America/New_York')).toBe('20');
    expect(dayIn(utc, 'Europe/Madrid')).toBe('21');
    expect(() => parseInstant('2026-10-21T03:30:00')).toThrow(SyntaxError);
    expect(() => parseInstant('2026-02-30T00:00:00Z')).toThrow(RangeError);
  });

  it('Section 9: a calendar date string is kept as a date and never shifted by a zone', () => {
    const kept = keepLocalDate('2026-10-20');
    expect(kept).toEqual({ year: 2026, month: 10, day: 20 });
    expect(formatLocalDate(kept)).toBe('2026-10-20');
    expect(displayLocalDate(kept, 'en-US')).toBe('October 20, 2026');
    const atMidnightUtc = new Date('2026-10-20');
    const inNewYork = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'America/New_York' });
    expect(inNewYork.format(atMidnightUtc)).toBe('October 19, 2026');
    expect(() => keepLocalDate('2026-02-30')).toThrow(RangeError);
  });

  it('Section 9: a decimal string converts to minor units without float drift', () => {
    expect(decimalToMinor('19.90', 2)).toBe(1990n);
    expect(decimalToMinor('12345678901234567.89', 2)).toBe(1234567890123456789n);
    expect(decimalToMinor('-0.05', 2)).toBe(-5n);
    expect(decimalToMinor('1235', 0)).toBe(1235n);
    expect(minorToDecimal(1234567890123456789n, 2)).toBe('12345678901234567.89');
    expect(minorToDecimal(-5n, 2)).toBe('-0.05');
    expect(Number('12345678901234567.89')).toBe(12345678901234568);
    expect(() => decimalToMinor('19.905', 2)).toThrow(RangeError);
  });

  it('Section 9: a Long above 2^53 loses digits as a JSON number and keeps them as a string', () => {
    const asNumber: { id: number } = JSON.parse('{"id":9007199254740993}');
    const asString: { id: string } = JSON.parse('{"id":"9007199254740993"}');
    expect(asNumber.id).toBe(9007199254740992);
    expect(readLongId(asString.id)).toBe('9007199254740993');
    expect(() => readLongId(asNumber.id)).toThrow(RangeError);
    expect(readLongId(42)).toBe('42');
    expect(() => readLongId('9223372036854775808')).toThrow(RangeError);
  });
});
