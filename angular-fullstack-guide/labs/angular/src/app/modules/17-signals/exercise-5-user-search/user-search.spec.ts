import { TestBed } from '@angular/core/testing';
import { type User, USER_SEARCH_API, type UserSearchApi, UserSearch, toSearchTerm } from './user-search';

interface PendingCall {
  term: string;
  signal: AbortSignal;
  resolve: (users: readonly User[]) => void;
  reject: (error: Error) => void;
}

/** A fake API whose calls stay pending until the test settles them. */
class ControllableApi implements UserSearchApi {
  readonly calls: PendingCall[] = [];
  search(term: string, signal: AbortSignal): Promise<readonly User[]> {
    return new Promise((resolve, reject) => this.calls.push({ term, signal, resolve, reject }));
  }
}

const ada: User = { id: 1, name: 'Ada' };
const adele: User = { id: 2, name: 'Adele' };

/** Lets the resource's promise callbacks run, then flushes the scheduled signal work. */
async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  TestBed.tick();
}

function setup() {
  const api = new ControllableApi();
  TestBed.configureTestingModule({ providers: [{ provide: USER_SEARCH_API, useValue: api }] });
  return { api, search: TestBed.inject(UserSearch) };
}

describe('E17.5 UserSearch with resource()', () => {
  it('maps short queries to "no request"', () => {
    expect(toSearchTerm(' a ')).toBeUndefined();
    expect(toSearchTerm(' ad ')).toBe('ad');
  });

  it('stays idle and makes no request for short queries', async () => {
    const { api, search } = setup();
    search.query.set('a');
    await settle();
    expect(search.status()).toBe('idle');
    expect(api.calls).toHaveLength(0);
  });

  it('loads and then exposes results', async () => {
    const { api, search } = setup();
    search.query.set('ad');
    TestBed.tick();
    expect(search.status()).toBe('loading');
    api.calls[0]!.resolve([ada, adele]);
    await settle();
    expect(search.status()).toBe('resolved');
    expect(search.users()).toEqual([ada, adele]);
  });

  it('aborts the stale request when the query changes', async () => {
    const { api, search } = setup();
    search.query.set('ad');
    TestBed.tick();
    search.query.set('ada');
    TestBed.tick();
    expect(api.calls.map((c) => c.term)).toEqual(['ad', 'ada']);
    expect(api.calls[0]!.signal.aborted).toBe(true);
    expect(api.calls[1]!.signal.aborted).toBe(false);
  });

  it('ignores a late response from an aborted request', async () => {
    const { api, search } = setup();
    search.query.set('ad');
    TestBed.tick();
    search.query.set('ada');
    TestBed.tick();
    api.calls[1]!.resolve([ada]);
    await settle();
    api.calls[0]!.resolve([ada, adele]); // arrives last, but belongs to the old query
    await settle();
    expect(search.users()).toEqual([ada]);
  });

  it('reports errors without throwing from users()', async () => {
    const { api, search } = setup();
    search.query.set('ad');
    TestBed.tick();
    api.calls[0]!.reject(new Error('500'));
    await settle();
    expect(search.status()).toBe('error');
    expect(search.users()).toEqual([]);
    expect(search.errorMessage()).toBe('Search failed. Try again.');
  });

  it('retries with reload()', async () => {
    const { api, search } = setup();
    search.query.set('ad');
    TestBed.tick();
    api.calls[0]!.reject(new Error('500'));
    await settle();
    search.retry();
    TestBed.tick();
    expect(api.calls).toHaveLength(2);
    api.calls[1]!.resolve([ada]);
    await settle();
    expect(search.status()).toBe('resolved');
    expect(search.users()).toEqual([ada]);
  });
});
