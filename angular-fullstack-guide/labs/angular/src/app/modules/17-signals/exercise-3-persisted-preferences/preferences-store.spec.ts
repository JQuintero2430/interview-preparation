import { TestBed } from '@angular/core/testing';
import {
  DEFAULT_PREFERENCES,
  type KeyValueStorage,
  parsePreferences,
  PREFERENCES_KEY,
  PREFERENCES_STORAGE,
  PreferencesStore,
} from './preferences-store';

class FakeStorage implements KeyValueStorage {
  readonly data = new Map<string, string>();
  writes = 0;
  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.writes++;
    this.data.set(key, value);
  }
}

function setup(initial?: string) {
  const storage = new FakeStorage();
  if (initial !== undefined) storage.data.set(PREFERENCES_KEY, initial);
  TestBed.configureTestingModule({ providers: [{ provide: PREFERENCES_STORAGE, useValue: storage }] });
  return { storage, store: TestBed.inject(PreferencesStore) };
}

describe('E17.3 PreferencesStore', () => {
  it('uses defaults when nothing is stored', () => {
    const { store } = setup();
    expect(store.preferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('restores valid stored preferences', () => {
    const { store } = setup(JSON.stringify({ theme: 'dark', fontScale: 1.25 }));
    expect(store.isDark()).toBe(true);
    expect(store.preferences().fontScale).toBe(1.25);
  });

  it('falls back to defaults for corrupted or malformed data', () => {
    expect(parsePreferences('{not json')).toEqual(DEFAULT_PREFERENCES);
    expect(parsePreferences(JSON.stringify({ theme: 'neon', fontScale: 1 }))).toEqual(DEFAULT_PREFERENCES);
    expect(parsePreferences(JSON.stringify(null))).toEqual(DEFAULT_PREFERENCES);
  });

  it('persists changes when the effect runs', () => {
    const { store, storage } = setup();
    store.setTheme('dark');
    TestBed.tick();
    expect(JSON.parse(storage.data.get(PREFERENCES_KEY)!)).toEqual({ theme: 'dark', fontScale: 1 });
  });

  it('writes once for several synchronous changes, with the final state', () => {
    const { store, storage } = setup();
    TestBed.tick(); // initial run of the effect
    const writesBefore = storage.writes;
    store.setTheme('dark');
    store.setFontScale(1.5);
    TestBed.tick();
    expect(storage.writes - writesBefore).toBe(1);
    expect(JSON.parse(storage.data.get(PREFERENCES_KEY)!)).toEqual({ theme: 'dark', fontScale: 1.5 });
  });

  it('survives storage that throws, and reports that nothing was saved', () => {
    const broken: KeyValueStorage = {
      getItem: () => {
        throw new DOMException('denied', 'SecurityError');
      },
      setItem: () => {
        throw new DOMException('full', 'QuotaExceededError');
      },
    };
    TestBed.configureTestingModule({ providers: [{ provide: PREFERENCES_STORAGE, useValue: broken }] });
    const store = TestBed.inject(PreferencesStore);
    expect(store.preferences()).toEqual(DEFAULT_PREFERENCES);
    store.setTheme('dark');
    TestBed.tick();
    expect(store.isDark()).toBe(true);
    expect(store.persisted()).toBe(false);
  });

  it('clamps the font scale to a readable range', () => {
    const { store } = setup();
    store.setFontScale(10);
    expect(store.preferences().fontScale).toBe(2);
    store.setFontScale(0.1);
    expect(store.preferences().fontScale).toBe(0.75);
  });
});
