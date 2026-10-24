// Section 2 model: a prefix cache and a response gate for a typeahead. Our model, not a search library's code;
// latest-only is the guarantee 23 §8's switchMap gives (the gate drops an older answer, it cannot cancel a request).
// Derivation assumes our prefix match rule: the matches of a longer query are a subset of a shorter query's.
// Time and the network are not involved: the caller sends requests and passes the answers to `store`.

export interface PrefixCacheOptions {
  /** Shortest normalized query that may be looked up or sent. */
  readonly minLength: number;
  /** The most items one server answer carries; an answer that fills it may be cut off. */
  readonly limit: number;
  /** The most keys kept; the least recently used key is evicted first. */
  readonly capacity: number;
}

export type Lookup =
  | { readonly kind: 'skip' }
  | { readonly kind: 'hit'; readonly items: readonly string[]; readonly complete: boolean }
  | { readonly kind: 'derived'; readonly items: readonly string[]; readonly from: string }
  | { readonly kind: 'miss' };

export interface PrefixCache {
  lookup(query: string): Lookup;
  store(query: string, items: readonly string[], complete: boolean): void;
  size(): number;
}

interface Entry {
  readonly items: readonly string[];
  readonly complete: boolean;
}

export function normalize(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, ' ');
}

function derive(entries: ReadonlyMap<string, Entry>, key: string, minLength: number): { prefix: string; entry: Entry } | undefined {
  for (let end = key.length - 1; end >= minLength; end -= 1) {
    const prefix = key.slice(0, end);
    const entry = entries.get(prefix);
    if (entry?.complete) return { prefix, entry };
  }
  return undefined;
}

export function createPrefixCache({ minLength, limit, capacity }: PrefixCacheOptions): PrefixCache {
  const entries = new Map<string, Entry>();

  // A Map iterates in insertion order, so delete and set marks a key as the most recently used.
  const touch = (key: string): Entry | undefined => {
    const entry = entries.get(key);
    if (entry === undefined) return undefined;
    entries.delete(key);
    entries.set(key, entry);
    return entry;
  };

  const evict = (): void => {
    while (entries.size > capacity) {
      const oldest = entries.keys().next();
      if (oldest.done) return;
      entries.delete(oldest.value);
    }
  };

  return {
    lookup(query) {
      const key = normalize(query);
      if (key.length < minLength) return { kind: 'skip' };
      const exact = touch(key);
      if (exact !== undefined) return { kind: 'hit', items: exact.items, complete: exact.complete };
      const found = derive(entries, key, minLength);
      if (found === undefined) return { kind: 'miss' };
      touch(found.prefix);
      return { kind: 'derived', items: found.entry.items.filter((item) => item.toLowerCase().startsWith(key)), from: found.prefix };
    },
    store(query, items, complete) {
      const key = normalize(query);
      entries.delete(key);
      entries.set(key, { items, complete: complete && items.length < limit });
      evict();
    },
    size: () => entries.size,
  };
}

export interface ResponseGate {
  /** Numbers a request just before it is sent. */
  issue(): number;
  /** True only when no response with a higher number was applied yet; applying it marks it as the latest. */
  accept(seq: number): boolean;
}

export function createResponseGate(): ResponseGate {
  let issued = 0;
  let applied = 0;
  return {
    issue: () => {
      issued += 1;
      return issued;
    },
    accept: (seq) => {
      if (seq <= applied) return false;
      applied = seq;
      return true;
    },
  };
}
