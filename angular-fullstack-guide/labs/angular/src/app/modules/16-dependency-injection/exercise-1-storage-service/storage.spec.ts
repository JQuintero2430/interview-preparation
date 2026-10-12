import { Component, createEnvironmentInjector, EnvironmentInjector, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  AuditTrail,
  built,
  IN_MEMORY_STORE,
  InMemoryStore,
  KeyValueStore,
  PREFS_ALIAS,
  PREFS_COPY,
  PrefsReader,
  SessionStore,
  STORE_BY_KIND,
  STORE_KIND,
  UserPrefs,
} from './storage';

// A test double: records every write so the test sees what UserPrefs sent.
class RecordingStore extends KeyValueStore {
  readonly writes: string[] = [];

  get(): string | undefined {
    return undefined;
  }

  set(key: string, value: string): void {
    this.writes.push(`${key}=${value}`);
  }
}

@Component({ selector: 'lab-e1-reader-a', template: '' })
class ReaderA {
  readonly prefs = inject(UserPrefs);
}

@Component({ selector: 'lab-e1-reader-b', template: '' })
class ReaderB {
  readonly prefs = inject(UserPrefs);
}

describe('E16.1 A pluggable storage service', () => {
  beforeEach(() => {
    built.prefs = 0;
    built.factoryRuns = 0;
  });

  it('UserPrefs reads and writes through the provided store and a test store replaces it with providers', () => {
    TestBed.configureTestingModule({ providers: [IN_MEMORY_STORE] });
    const prefs = TestBed.inject(UserPrefs);
    expect(prefs.theme()).toBe('light');
    prefs.setTheme('dark');
    expect(prefs.theme()).toBe('dark');
    expect(TestBed.inject(KeyValueStore)).toBeInstanceOf(InMemoryStore);

    TestBed.resetTestingModule();
    const recording = new RecordingStore();
    TestBed.configureTestingModule({ providers: [{ provide: KeyValueStore, useValue: recording }] });
    TestBed.inject(UserPrefs).setTheme('dark');
    expect(recording.writes).toEqual(['theme=dark']);
  });

  it('useClass gives a distinct instance and useExisting gives the identical one', () => {
    TestBed.configureTestingModule({
      providers: [IN_MEMORY_STORE, PREFS_ALIAS, { provide: PREFS_COPY, useClass: UserPrefs }],
    });
    const target = TestBed.inject(UserPrefs);

    expect(TestBed.inject(PrefsReader)).toBe(target);
    expect(TestBed.inject(PREFS_COPY)).not.toBe(target);
    expect(built.prefs).toBe(2);
  });

  it('the factory variant picks the store by STORE_KIND and runs once per injector', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: STORE_KIND, useValue: 'memory' }, STORE_BY_KIND],
    });
    const root = TestBed.inject(KeyValueStore);
    expect(root).toBeInstanceOf(InMemoryStore);
    expect(TestBed.inject(KeyValueStore)).toBe(root);
    expect(built.factoryRuns).toBe(1);

    const child = createEnvironmentInjector(
      [{ provide: STORE_KIND, useValue: 'session' }, STORE_BY_KIND],
      TestBed.inject(EnvironmentInjector),
    );
    expect(child.get(KeyValueStore)).toBeInstanceOf(SessionStore);
    expect(built.factoryRuns).toBe(2);
  });

  it('the last provider for the token wins', () => {
    TestBed.configureTestingModule({
      providers: [IN_MEMORY_STORE, { provide: KeyValueStore, useClass: SessionStore }],
    });

    expect(TestBed.inject(KeyValueStore)).toBeInstanceOf(SessionStore);
  });

  it('an autoProvided false service fails with NG0201 until listed in providers', () => {
    expect(() => TestBed.inject(AuditTrail)).toThrowError(/NG0201: No provider found for `_?AuditTrail`/);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [AuditTrail] });
    expect(TestBed.inject(AuditTrail).entries).toEqual([]);
  });

  it('UserPrefs is one instance across two consumers', () => {
    TestBed.configureTestingModule({ providers: [IN_MEMORY_STORE] });
    const a = TestBed.createComponent(ReaderA).componentInstance.prefs;
    const b = TestBed.createComponent(ReaderB).componentInstance.prefs;

    expect(a).toBe(b);
    expect(built.prefs).toBe(1);
  });
});
