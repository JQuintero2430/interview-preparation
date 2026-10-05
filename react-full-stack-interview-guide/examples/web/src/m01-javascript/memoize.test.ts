import { memoize } from './memoize';

test('calls the function once per distinct argument list', () => {
  const fn = vi.fn((a: number, b: number) => a + b);
  const m = memoize(fn);
  expect(m(1, 2)).toBe(3);
  expect(m(1, 2)).toBe(3);
  expect(m(2, 1)).toBe(3);
  expect(fn).toHaveBeenCalledTimes(2);
});

test('caches falsy and undefined results', () => {
  const zero = vi.fn((key: string) => Number(key === 'never'));
  const m = memoize(zero);
  m('a');
  m('a');
  expect(zero).toHaveBeenCalledTimes(1);

  const nothing = vi.fn((key: string): number | undefined => (key === 'never' ? 1 : undefined));
  const m2 = memoize(nothing);
  m2('a');
  m2('a');
  expect(nothing).toHaveBeenCalledTimes(1);
});

test('the default key sees equal objects as equal, regardless of identity', () => {
  const fn = vi.fn((o: { id: number }) => o.id * 2);
  const m = memoize(fn);
  m({ id: 1 });
  m({ id: 1 });
  expect(fn).toHaveBeenCalledTimes(1);
});

test('the default key conflates different things; a custom keyFn fixes it', () => {
  const fn = vi.fn((x: unknown) => typeof x);
  const naive = memoize(fn);
  // JSON.stringify([undefined]) === JSON.stringify([null]) === "[null]"
  expect(naive(undefined)).toBe('undefined');
  expect(naive(null)).toBe('undefined'); // WRONG: served from the undefined entry

  const fn2 = vi.fn((x: unknown) => typeof x);
  const careful = memoize(fn2, (x) => (x === undefined ? 'undef' : JSON.stringify(x)));
  expect(careful(undefined)).toBe('undefined');
  expect(careful(null)).toBe('object');
});

test('exposes its cache for inspection or clearing', () => {
  const m = memoize((n: number) => n * n);
  m(3);
  expect(m.cache.size).toBe(1);
  m.cache.clear();
  expect(m.cache.size).toBe(0);
});
