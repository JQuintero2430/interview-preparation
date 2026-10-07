// labs/angular/src/app/modules/17-signals/exercise-3-persisted-preferences/preferences-store.ts
import { computed, effect, inject, InjectionToken, Service, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

export interface Preferences {
  readonly theme: Theme;
  readonly fontScale: number;
}

export const DEFAULT_PREFERENCES: Preferences = { theme: 'light', fontScale: 1 };
export const PREFERENCES_KEY = 'lab.preferences';
export const MIN_FONT_SCALE = 0.75;
export const MAX_FONT_SCALE = 2;

/** The slice of the Web Storage API the store needs. A token, so tests can pass an in-memory fake. */
export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

export const PREFERENCES_STORAGE = new InjectionToken<KeyValueStorage>('PREFERENCES_STORAGE', {
  providedIn: 'root',
  factory: () => localStorage,
});

/** Reads the raw value; storage APIs throw in private mode or when disabled by policy. */
export function readRaw(storage: KeyValueStorage): string | null {
  try {
    return storage.getItem(PREFERENCES_KEY);
  } catch {
    return null;
  }
}

/** Writes the value and reports success instead of throwing (quota exceeded, storage disabled). */
export function writeRaw(storage: KeyValueStorage, value: string): boolean {
  try {
    storage.setItem(PREFERENCES_KEY, value);
    return true;
  } catch {
    return false;
  }
}

/** Stored data is untrusted: validate its shape instead of casting it. */
export function parsePreferences(raw: string | null): Preferences {
  if (raw === null) return DEFAULT_PREFERENCES;
  try {
    const value: unknown = JSON.parse(raw);
    return isPreferences(value) ? value : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function isPreferences(value: unknown): value is Preferences {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  const validTheme = candidate['theme'] === 'light' || candidate['theme'] === 'dark';
  return validTheme && typeof candidate['fontScale'] === 'number';
}

@Service()
export class PreferencesStore {
  readonly #storage = inject(PREFERENCES_STORAGE);
  readonly #prefs = signal(parsePreferences(readRaw(this.#storage)));

  readonly #persisted = signal(true);

  readonly preferences = this.#prefs.asReadonly();
  /** False when the last write failed, so the UI can say "your settings will not be saved". */
  readonly persisted = this.#persisted.asReadonly();
  readonly isDark = computed(() => this.#prefs().theme === 'dark');

  constructor() {
    // A legitimate effect: it pushes signal state OUT to a non-reactive system (Web Storage).
    // Its only signal write is the status flag it does not read, so it cannot loop.
    effect(() => {
      const ok = writeRaw(this.#storage, JSON.stringify(this.#prefs()));
      this.#persisted.set(ok);
    });
  }

  setTheme(theme: Theme): void {
    this.#prefs.update((p) => ({ ...p, theme }));
  }

  setFontScale(fontScale: number): void {
    const clamped = Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, fontScale));
    this.#prefs.update((p) => ({ ...p, fontScale: clamped }));
  }
}
