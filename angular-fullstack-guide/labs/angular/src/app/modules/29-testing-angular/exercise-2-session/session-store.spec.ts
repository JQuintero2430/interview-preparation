import { TestBed } from '@angular/core/testing';
import { CLOCK, Clock } from './clock';
import { FakeClock } from './fake-clock';
import { InMemoryStorage } from './in-memory-storage';
import { SESSION_STORAGE, SessionStoragePort } from './session-storage';
import { SESSION_KEY, SessionStore } from './session-store';

interface Provided {
  advance(ms: number): void;
  seed(raw: string): void;
  stored(): string | null;
  writes(): number;
}

type Provide = () => Provided;

const provideFakes: Provide = () => {
  const clock = new FakeClock();
  const storage = new InMemoryStorage();
  TestBed.configureTestingModule({
    providers: [
      { provide: CLOCK, useValue: clock },
      { provide: SESSION_STORAGE, useValue: storage },
    ],
  });
  return {
    advance: (ms) => clock.advance(ms),
    seed: (raw) => storage.seed(SESSION_KEY, raw),
    stored: () => storage.getItem(SESSION_KEY),
    writes: () => storage.writes(),
  };
};

const provideStubs: Provide = () => {
  let time = 1_000_000;
  let raw: string | null = null;
  const now = vi.fn<Clock['now']>().mockReturnValue(time);
  const getItem = vi.fn<SessionStoragePort['getItem']>(() => raw);
  const setItem = vi.fn<SessionStoragePort['setItem']>();
  TestBed.configureTestingModule({
    providers: [
      { provide: CLOCK, useValue: { now } },
      { provide: SESSION_STORAGE, useValue: { getItem, setItem } },
    ],
  });
  return {
    advance: (ms) => {
      time += ms;
      now.mockReturnValue(time);
    },
    seed: (value) => {
      raw = value;
    },
    stored: () => setItem.mock.calls.at(-1)?.[1] ?? null,
    writes: () => setItem.mock.calls.length,
  };
};

const providerSets: [string, Provide][] = [
  ['fakes', provideFakes],
  ['vi.fn stubs', provideStubs],
];

const TTL_MS = 60_000;
const FAR_FUTURE = 9_999_999_999_999;

describe.each(providerSets)('E29.2 session store (%s)', (_name, provide) => {
  it('a started session is not expired', () => {
    provide();
    const store = TestBed.inject(SessionStore);
    store.start('ana', TTL_MS);
    expect(store.user()).toBe('ana');
    expect(store.expired()).toBe(false);
  });

  it('a session expires after its time to live', () => {
    const { advance } = provide();
    const store = TestBed.inject(SessionStore);
    store.start('ana', TTL_MS);
    advance(TTL_MS - 1);
    store.refresh();
    expect(store.expired()).toBe(false);
    advance(1);
    store.refresh();
    expect(store.expired()).toBe(true);
  });

  it('the remaining time counts down with the clock', () => {
    const { advance } = provide();
    const store = TestBed.inject(SessionStore);
    store.start('ana', TTL_MS);
    advance(15_000);
    expect(store.remainingMs()).toBe(45_000);
  });

  it('starting a session writes it to storage once', () => {
    const { stored, writes } = provide();
    const store = TestBed.inject(SessionStore);
    store.start('ana', TTL_MS);
    expect(writes()).toBe(1);
    expect(stored()).toContain('"user":"ana"');
  });

  it('a stored session is restored when the service is created', () => {
    const { seed } = provide();
    seed(JSON.stringify({ user: 'bo', expiresAt: FAR_FUTURE }));
    const store = TestBed.inject(SessionStore);
    expect(store.user()).toBe('bo');
    expect(store.expired()).toBe(false);
  });

  it('a corrupt stored value starts with no session', () => {
    const { seed } = provide();
    seed('{not json');
    const store = TestBed.inject(SessionStore);
    expect(store.user()).toBeNull();
    expect(store.expired()).toBe(false);
  });
});
