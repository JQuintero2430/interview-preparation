import { inject, InjectionToken, Provider, Service } from '@angular/core';

// Counts constructions and factory runs so a test asserts how many happened.
export const built = { prefs: 0, factoryRuns: 0 };

// The token consumers depend on: an abstract class exists at run time, an interface does not.
export abstract class KeyValueStore {
  abstract get(key: string): string | undefined;
  abstract set(key: string, value: string): void;
}

// Two in-memory stores stand in for real browser storage, which no lab test touches.
@Service({ autoProvided: false })
export class InMemoryStore extends KeyValueStore {
  readonly #entries = new Map<string, string>();

  get(key: string): string | undefined {
    return this.#entries.get(key);
  }

  set(key: string, value: string): void {
    this.#entries.set(key, value);
  }
}

@Service({ autoProvided: false })
export class SessionStore extends KeyValueStore {
  readonly #entries = new Map<string, string>();

  get(key: string): string | undefined {
    return this.#entries.get(key);
  }

  set(key: string, value: string): void {
    this.#entries.set(key, value);
  }
}

export const STORE_KIND = new InjectionToken<'memory' | 'session'>('lab-e1-store-kind');

// What an app lists: one recipe per token.
export const IN_MEMORY_STORE: Provider = { provide: KeyValueStore, useClass: InMemoryStore };

// The factory variant reads STORE_KIND, so the choice is data, not code.
export const STORE_BY_KIND: Provider = {
  provide: KeyValueStore,
  useFactory: () => {
    built.factoryRuns++;
    return inject(STORE_KIND) === 'session' ? new SessionStore() : new InMemoryStore();
  },
};

// What consumers that only read ask for.
export abstract class PrefsReader {
  abstract theme(): string;
}

@Service()
export class UserPrefs implements PrefsReader {
  readonly #store = inject(KeyValueStore);

  constructor() {
    built.prefs++;
  }

  theme(): string {
    return this.#store.get('theme') ?? 'light';
  }

  setTheme(theme: string): void {
    this.#store.set('theme', theme);
  }
}

// An alias gives the instance a second name; a useClass copy would build another.
export const PREFS_ALIAS: Provider = { provide: PrefsReader, useExisting: UserPrefs };
export const PREFS_COPY = new InjectionToken<PrefsReader>('lab-e1-prefs-copy');

// A helper nobody registers for you: it is found only where a providers array lists it.
@Service({ autoProvided: false })
export class AuditTrail {
  readonly entries: string[] = [];
}
