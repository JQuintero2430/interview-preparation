import { LRUCache } from './lruCache';

test('evicts the least recently used entry when full', () => {
  const cache = new LRUCache<string, number>(2);
  cache.set('a', 1).set('b', 2);
  cache.set('c', 3);
  expect(cache.has('a')).toBe(false);
  expect(cache.keys()).toEqual(['b', 'c']);
});

test('get refreshes recency', () => {
  const cache = new LRUCache<string, number>(2);
  cache.set('a', 1).set('b', 2);
  expect(cache.get('a')).toBe(1);
  cache.set('c', 3); // evicts b, not a
  expect(cache.keys()).toEqual(['a', 'c']);
});

test('set on an existing key updates the value and refreshes recency without evicting', () => {
  const cache = new LRUCache<string, number>(2);
  cache.set('a', 1).set('b', 2);
  cache.set('a', 10);
  expect(cache.size).toBe(2);
  expect(cache.keys()).toEqual(['b', 'a']);
  expect(cache.get('a')).toBe(10);
});

test('has does not refresh recency', () => {
  const cache = new LRUCache<string, number>(2);
  cache.set('a', 1).set('b', 2);
  cache.has('a');
  cache.set('c', 3);
  expect(cache.has('a')).toBe(false);
});

test('misses return undefined, falsy values are real hits', () => {
  const cache = new LRUCache<string, number>(2);
  expect(cache.get('nope')).toBeUndefined();
  cache.set('zero', 0);
  expect(cache.get('zero')).toBe(0);
});

test('delete and capacity validation', () => {
  const cache = new LRUCache<string, number>(1);
  cache.set('a', 1);
  expect(cache.delete('a')).toBe(true);
  expect(cache.size).toBe(0);
  expect(() => new LRUCache(0)).toThrow(RangeError);
  expect(() => new LRUCache(1.5)).toThrow(RangeError);
});
