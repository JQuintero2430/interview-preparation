// Section 2 claims, about our model (prefix-cache.ts), not a search library's: the minimum length, one key per
// normalized query, derivation from a complete prefix only, least-recently-used eviction, and a response gate.
// Our fake server answers from a fixed catalog by prefix; no network, clock or randomness is involved.
import { describe, expect, it } from 'vitest';
import { createPrefixCache, createResponseGate, normalize } from './prefix-cache';

const catalog = ['Angle grinder', 'Angular book', 'Angular guide', 'Antenna', 'Anvil'];

function fakeServer(query: string, limit: number): { items: readonly string[]; complete: boolean } {
  const matches = catalog.filter((name) => name.toLowerCase().startsWith(normalize(query)));
  return { items: matches.slice(0, limit), complete: matches.length <= limit };
}

const options = { minLength: 2, limit: 4, capacity: 8 };

describe('Section 2: prefix cache and response gate', () => {
  it('Section 2: a query shorter than the minimum length sends no request', () => {
    const cache = createPrefixCache(options);
    expect(cache.lookup('a')).toEqual({ kind: 'skip' });
    expect(cache.lookup(' A ')).toEqual({ kind: 'skip' });
    expect(cache.lookup('an')).toEqual({ kind: 'miss' });
  });

  it('Section 2: inputs that normalize to the same key share one cache entry', () => {
    const cache = createPrefixCache(options);
    const answer = fakeServer('ang', options.limit);
    cache.store('ang', answer.items, answer.complete);
    cache.store('Ang ', answer.items, answer.complete);
    expect(cache.size()).toBe(1);
    expect(cache.lookup('  ANG')).toEqual({ kind: 'hit', items: answer.items, complete: true });
  });

  it('Section 2: a complete result for a prefix answers a longer query without a request', () => {
    const cache = createPrefixCache(options);
    const answer = fakeServer('ang', options.limit);
    cache.store('ang', answer.items, answer.complete);
    expect(cache.lookup('angu')).toEqual({ kind: 'derived', items: ['Angular book', 'Angular guide'], from: 'ang' });
    expect(cache.lookup('angular g')).toEqual({ kind: 'derived', items: ['Angular guide'], from: 'ang' });
  });

  it('Section 2: a truncated result for a prefix does not answer a longer query', () => {
    const cache = createPrefixCache(options);
    const answer = fakeServer('an', options.limit);
    expect(answer.complete).toBe(false);
    cache.store('an', answer.items, answer.complete);
    expect(cache.lookup('an')).toEqual({ kind: 'hit', items: answer.items, complete: false });
    expect(cache.lookup('ang')).toEqual({ kind: 'miss' });
    cache.store('ang', ['Angle grinder'], true);
    cache.store('anv', ['Anvil'], true);
    expect(cache.lookup('anvi')).toEqual({ kind: 'derived', items: ['Anvil'], from: 'anv' });
  });

  it('Section 2: the cache evicts the least recently used key beyond its capacity', () => {
    const cache = createPrefixCache({ minLength: 2, limit: 3, capacity: 2 });
    cache.store('an', ['Antenna'], true);
    cache.store('be', [], true);
    cache.lookup('an');
    cache.store('co', [], true);
    expect(cache.size()).toBe(2);
    expect(cache.lookup('be')).toEqual({ kind: 'miss' });
    expect(cache.lookup('an')).toEqual({ kind: 'hit', items: ['Antenna'], complete: true });
  });

  it('Section 2: a response older than the last one applied is dropped', () => {
    const gate = createResponseGate();
    const forAn = gate.issue();
    const forAng = gate.issue();
    expect(gate.accept(forAng)).toBe(true);
    expect(gate.accept(forAn)).toBe(false);
    expect(gate.accept(forAng)).toBe(false);
    expect(gate.accept(gate.issue())).toBe(true);
  });
});
