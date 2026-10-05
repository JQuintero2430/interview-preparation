import { readJson, writeJson } from './storage';

afterEach(() => localStorage.clear());

test('round-trips JSON through localStorage (values are strings underneath)', () => {
  expect(writeJson(localStorage, 'prefs', { dark: true })).toBe(true);
  expect(localStorage.getItem('prefs')).toBe('{"dark":true}');
  expect(readJson(localStorage, 'prefs', { dark: false })).toEqual({ dark: true });
});

test('missing or corrupt values fall back instead of throwing', () => {
  expect(readJson(localStorage, 'nope', 'fallback')).toBe('fallback');
  localStorage.setItem('bad', '{not json');
  expect(readJson(localStorage, 'bad', 'fallback')).toBe('fallback');
});

test('a throwing storage (quota exceeded) is reported as false, not thrown', () => {
  const full = {
    setItem: () => {
      throw new DOMException('quota', 'QuotaExceededError');
    },
  };
  expect(writeJson(full, 'k', 1)).toBe(false);
});

test('sessionStorage and localStorage are separate stores', () => {
  localStorage.setItem('a', '1');
  expect(sessionStorage.getItem('a')).toBeNull();
});

test('storing undefined becomes the STRING "undefined" via setItem, but JSON.stringify(undefined) is undefined', () => {
  localStorage.setItem('u', String(undefined));
  expect(localStorage.getItem('u')).toBe('undefined');
  expect(readJson(localStorage, 'u', 'fallback')).toBe('fallback'); // JSON.parse('undefined') throws
});
