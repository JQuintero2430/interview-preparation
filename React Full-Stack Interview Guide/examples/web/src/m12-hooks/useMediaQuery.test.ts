import { act, renderHook } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

// jsdom has no matchMedia. This fake keeps one entry per query string and lets the test
// flip `matches` and fire `change`, the way a browser does when the window is resized.
type Entry = { matches: boolean; listeners: Set<() => void> };
const queries = new Map<string, Entry>();

function entryFor(query: string): Entry {
  let entry = queries.get(query);
  if (!entry) {
    entry = { matches: false, listeners: new Set() };
    queries.set(query, entry);
  }
  return entry;
}

function fakeMatchMedia(query: string): MediaQueryList {
  const entry = entryFor(query);
  const list = {
    media: query,
    get matches() {
      return entry.matches;
    },
    addEventListener: (_type: string, listener: () => void) => entry.listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => entry.listeners.delete(listener),
  };
  return list as unknown as MediaQueryList;
}

function setMatches(query: string, matches: boolean) {
  const entry = entryFor(query);
  entry.matches = matches;
  act(() => entry.listeners.forEach((listener) => listener()));
}

const WIDE = '(min-width: 768px)';
const DARK = '(prefers-color-scheme: dark)';

beforeEach(() => {
  queries.clear();
  Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: fakeMatchMedia });
});

test('reads the current match on the first render', () => {
  entryFor(WIDE).matches = true;
  const { result } = renderHook(() => useMediaQuery(WIDE));
  expect(result.current).toBe(true);
});

test('re-renders when the media query starts or stops matching', () => {
  const { result } = renderHook(() => useMediaQuery(WIDE));
  expect(result.current).toBe(false);
  setMatches(WIDE, true);
  expect(result.current).toBe(true);
  setMatches(WIDE, false);
  expect(result.current).toBe(false);
});

test('changing the query resubscribes: the old list loses its listener', () => {
  const { result, rerender } = renderHook(({ query }) => useMediaQuery(query), {
    initialProps: { query: WIDE },
  });
  entryFor(DARK).matches = true;
  rerender({ query: DARK });

  expect(result.current).toBe(true);
  expect(entryFor(WIDE).listeners.size).toBe(0);
  expect(entryFor(DARK).listeners.size).toBe(1);
});

test('unsubscribes on unmount', () => {
  const { unmount } = renderHook(() => useMediaQuery(WIDE));
  unmount();
  expect(entryFor(WIDE).listeners.size).toBe(0);
});
