import { promiseAll } from './promiseAll';

const later = <T>(value: T, ms: number) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

test('keeps input order even when promises settle out of order', async () => {
  vi.useFakeTimers();
  try {
    const p = promiseAll([later('slow', 30), later('fast', 10), 'plain']);
    await vi.advanceTimersByTimeAsync(30);
    expect(await p).toEqual(['slow', 'fast', 'plain']);
  } finally {
    vi.useRealTimers();
  }
});

test('empty input resolves to an empty array', async () => {
  expect(await promiseAll([])).toEqual([]);
});

test('rejects with the first rejection', async () => {
  const p = promiseAll([Promise.resolve(1), Promise.reject(new Error('first')), Promise.reject(new Error('second'))]);
  await expect(p).rejects.toThrow('first');
});

test('accepts any iterable and thenables', async () => {
  const thenable: PromiseLike<number> = { then: (ok) => Promise.resolve(7).then(ok) };
  expect(await promiseAll(new Set([1, 2]))).toEqual([1, 2]);
  expect(await promiseAll([thenable])).toEqual([7]);
});

test('matches the native result', async () => {
  const input = [1, Promise.resolve(2), later(3, 0)];
  expect(await promiseAll(input)).toEqual(await Promise.all(input));
});
