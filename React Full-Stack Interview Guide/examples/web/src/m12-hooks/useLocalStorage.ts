import { useCallback, useMemo, useSyncExternalStore } from 'react';

// The browser fires `storage` only in OTHER tabs, so writes from this tab announce themselves.
const SAME_TAB_EVENT = 'm12:local-storage';

type Updater<T> = T | ((previous: T) => T);
type Validator<T> = (value: unknown) => value is T;

// Module-level, so its identity is stable and React never re-subscribes.
function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(SAME_TAB_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(SAME_TAB_EVENT, onStoreChange);
  };
}

// localStorage throws in some browsers (private mode, blocked site data, full quota).
function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, raw: string | null): boolean {
  try {
    if (raw === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, raw);
    return true;
  } catch {
    return false;
  } finally {
    window.dispatchEvent(new Event(SAME_TAB_EVENT));
  }
}

// Anything missing, unparsable, `null`, or rejected by the validator yields the fallback.
function parse<T>(raw: string | null, fallback: T, validate?: Validator<T>): T {
  if (raw === null) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null) return fallback;
    if (validate && !validate(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

function isUpdater<T>(next: Updater<T>): next is (previous: T) => T {
  return typeof next === 'function';
}

/**
 * State persisted in localStorage and kept in sync across components and tabs.
 * The raw string is the external-store snapshot: a primitive, so `Object.is` compares it
 * by value and an unchanged key never re-renders.
 * @param key - Namespaced storage key, e.g. `myapp.theme`.
 * @param initialValue - Used when nothing valid is stored, and on the server. Keep it stable
 *   (a primitive or a module-level constant), because it is a memo dependency.
 * @param validate - Optional type guard; a stored value that fails it yields `initialValue`.
 * @returns `[value, setValue, remove]`. `setValue` returns false when the write failed.
 */
export function useLocalStorage<T>(key: string, initialValue: T, validate?: Validator<T>) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null, // server snapshot: no storage there, so hydrate with initialValue
  );

  const value = useMemo(() => parse(raw, initialValue, validate), [raw, initialValue, validate]);

  const setValue = useCallback(
    (next: Updater<T>): boolean => {
      // Read the store, not `value`: two calls in one handler must see each other's writes.
      const previous = parse(readRaw(key), initialValue, validate);
      const resolved = isUpdater(next) ? next(previous) : next;
      return writeRaw(key, JSON.stringify(resolved));
    },
    [key, initialValue, validate],
  );

  const remove = useCallback(() => writeRaw(key, null), [key]);

  return [value, setValue, remove] as const;
}
