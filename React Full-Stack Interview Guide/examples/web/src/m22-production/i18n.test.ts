import { createFormatters, createTranslator } from './i18n';

const en = {
  greeting: 'Hello, {name}!',
  items: '{count, plural, =0 {No items} one {# item} other {# items}} in your cart',
  total: 'Total: {amount}',
};

test('interpolates values and formats numbers for the locale', () => {
  const t = createTranslator('en-US', en);
  expect(t('greeting', { name: 'Ada' })).toBe('Hello, Ada!');
  expect(t('total', { amount: 1234567 })).toBe('Total: 1,234,567');
});

test('english plural rules: exact match, one, other', () => {
  const t = createTranslator('en-US', en);
  expect(t('items', { count: 0 })).toBe('No items in your cart');
  expect(t('items', { count: 1 })).toBe('1 item in your cart');
  expect(t('items', { count: 1000 })).toBe('1,000 items in your cart');
});

test('polish has few and many categories that english lacks', () => {
  const pl = { items: '{count, plural, one {# plik} few {# pliki} many {# plikow} other {# pliku}}' };
  const t = createTranslator('pl', pl);
  expect(t('items', { count: 1 })).toBe('1 plik');
  expect(t('items', { count: 2 })).toBe('2 pliki');
  expect(t('items', { count: 5 })).toBe('5 plikow');
});

test('a missing key falls back, then returns the key and reports it', () => {
  const missing: string[] = [];
  const t = createTranslator('es', { greeting: 'Hola, {name}!' }, en, (k) => missing.push(k));
  expect(t('total', { amount: 5 })).toBe('Total: 5');
  expect(t('nope')).toBe('nope');
  expect(missing).toEqual(['nope']);
});

test('an unknown placeholder is left visible rather than hidden', () => {
  expect(createTranslator('en-US', en)('greeting')).toBe('Hello, {name}!');
});

describe('Intl formatters', () => {
  test('currency differs by locale', () => {
    expect(createFormatters('en-US').currency(1234.5, 'USD')).toBe('$1,234.50');
    expect(createFormatters('de-DE').currency(1234.5, 'EUR')).toMatch(/^1\.234,50\s€$/);
  });

  test('dates take an explicit time zone so the test is stable', () => {
    const date = new Date(Date.UTC(2026, 0, 15, 12));
    expect(createFormatters('en-US').date(date, { dateStyle: 'medium', timeZone: 'UTC' })).toBe('Jan 15, 2026');
  });

  test('relative time and lists', () => {
    const f = createFormatters('en-US');
    expect(f.relative(-1, 'day')).toBe('yesterday');
    expect(f.relative(3, 'day')).toBe('in 3 days');
    expect(f.list(['a', 'b', 'c'])).toBe('a, b, and c');
  });
});
