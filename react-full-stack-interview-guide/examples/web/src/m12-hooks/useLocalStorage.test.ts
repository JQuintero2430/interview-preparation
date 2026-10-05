import { act, renderHook } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

const KEY = 'm12demo.theme';
type Theme = 'light' | 'dark';
const isTheme = (v: unknown): v is Theme => v === 'light' || v === 'dark';

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

test('falls back to the initial value when nothing is stored', () => {
  const { result } = renderHook(() => useLocalStorage<Theme>(KEY, 'light'));
  expect(result.current[0]).toBe('light');
});

test('setValue writes JSON to storage and re-renders', () => {
  const { result } = renderHook(() => useLocalStorage<Theme>(KEY, 'light'));
  act(() => {
    result.current[1]('dark');
  });
  expect(result.current[0]).toBe('dark');
  expect(localStorage.getItem(KEY)).toBe('"dark"');
});

test('functional updates read the stored value, so two calls in one batch compose', () => {
  const { result } = renderHook(() => useLocalStorage('m12demo.count', 0));
  act(() => {
    result.current[1]((n) => n + 1);
    result.current[1]((n) => n + 1);
  });
  expect(result.current[0]).toBe(2);
});

test('two hooks with the same key stay in sync (they share the store, not React state)', () => {
  const a = renderHook(() => useLocalStorage<Theme>(KEY, 'light'));
  const b = renderHook(() => useLocalStorage<Theme>(KEY, 'light'));
  act(() => {
    a.result.current[1]('dark');
  });
  expect(b.result.current[0]).toBe('dark');
});

test('picks up writes from another tab via the storage event', () => {
  const { result } = renderHook(() => useLocalStorage<Theme>(KEY, 'light'));
  act(() => {
    localStorage.setItem(KEY, '"dark"'); // what the other tab did
    window.dispatchEvent(new Event('storage')); // what the browser tells this tab
  });
  expect(result.current[0]).toBe('dark');
});

test.each(['not json', 'null', '"purple"'])('stored %s yields the initial value', (raw) => {
  localStorage.setItem(KEY, raw);
  const { result } = renderHook(() => useLocalStorage<Theme>(KEY, 'light', isTheme));
  expect(result.current[0]).toBe('light');
});

test('remove() deletes the key and returns to the initial value', () => {
  localStorage.setItem(KEY, '"dark"');
  const { result } = renderHook(() => useLocalStorage<Theme>(KEY, 'light'));
  act(() => {
    result.current[2]();
  });
  expect(localStorage.getItem(KEY)).toBeNull();
  expect(result.current[0]).toBe('light');
});

test('a failing write returns false instead of throwing', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('quota', 'QuotaExceededError');
  });
  const { result } = renderHook(() => useLocalStorage<Theme>(KEY, 'light'));
  let ok = true;
  act(() => {
    ok = result.current[1]('dark');
  });
  expect(ok).toBe(false);
  expect(result.current[0]).toBe('light');
});
