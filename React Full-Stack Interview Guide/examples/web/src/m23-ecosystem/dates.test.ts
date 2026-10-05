import { addDaysUtc, diffInDays, formatShortDate, isValidDate, relativeTime } from './dates';

const base = new Date('2024-01-05T12:00:00Z');

test('formatShortDate formats with Intl in a fixed zone', () => {
  expect(formatShortDate(base)).toBe('Jan 5, 2024');
});

test('addDaysUtc does not mutate its input (moment mutated)', () => {
  const next = addDaysUtc(base, 30);
  expect(next.toISOString()).toBe('2024-02-04T12:00:00.000Z');
  expect(base.toISOString()).toBe('2024-01-05T12:00:00.000Z');
});

test('diffInDays truncates toward zero', () => {
  expect(diffInDays(base, new Date('2024-01-08T11:00:00Z'))).toBe(2);
  expect(diffInDays(new Date('2024-01-08T11:00:00Z'), base)).toBe(-2);
});

test('isValidDate detects Invalid Date', () => {
  expect(isValidDate(new Date('nope'))).toBe(false);
  expect(isValidDate(base)).toBe(true);
});

test('relativeTime picks a unit and reads naturally', () => {
  expect(relativeTime(new Date(base.getTime() - 3 * 3600_000), base)).toBe('3 hours ago');
  expect(relativeTime(new Date(base.getTime() + 5 * 60_000), base)).toBe('in 5 minutes');
  expect(relativeTime(new Date(base.getTime() - 86_400_000), base)).toBe('yesterday');
});
