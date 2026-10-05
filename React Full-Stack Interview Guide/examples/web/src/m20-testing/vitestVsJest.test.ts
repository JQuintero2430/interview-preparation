// Each test pins down one behavior where Vitest differs from Jest (Vitest "Migrating from Jest" guide).
// Explicit imports work with or without `globals: true`; this repo enables globals, Vitest's default is off.
import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => vi.useRealTimers());

test('mockReset() goes back to the ORIGINAL implementation (Jest: to an empty function)', () => {
  const greet = vi.fn((name: string) => `Hello, ${name}`);
  greet.mockReturnValue('stubbed');
  expect(greet('Ada')).toBe('stubbed');

  greet.mockReset();
  expect(greet('Ada')).toBe('Hello, Ada');
  expect(greet).toHaveBeenCalledTimes(1); // the reset also cleared the earlier call
});

test('fn.mock is one persistent object (Jest replaces it on mockClear)', () => {
  const fn = vi.fn();
  const state = fn.mock;
  fn('a');
  fn.mockClear();
  expect(state).toBe(fn.mock);
  expect(state.calls).toEqual([]);
});

// Module-level mock, called in two tests. Vitest 5 runs vi.clearAllMocks() before every test.
const shared = vi.fn();

test('clearMocks default, part 1', () => {
  shared();
  expect(shared).toHaveBeenCalledTimes(1);
});

test('clearMocks default, part 2: the call from part 1 is gone', () => {
  shared();
  expect(shared).toHaveBeenCalledTimes(1);
});

test('vi.spyOn calls through until you stub it; mockRestore puts the real method back', () => {
  const calculator = { add: (a: number, b: number) => a + b };
  const spy = vi.spyOn(calculator, 'add');

  expect(calculator.add(1, 2)).toBe(3);
  expect(spy).toHaveBeenCalledWith(1, 2);

  spy.mockImplementation(() => 0);
  expect(calculator.add(1, 2)).toBe(0);

  spy.mockRestore();
  expect(calculator.add(1, 2)).toBe(3);
  expect(vi.isMockFunction(calculator.add)).toBe(false);
});

test('there is no `jest` global under Vitest, which is why RTL cannot auto-advance fake timers', () => {
  expect('jest' in globalThis).toBe(false);
});

test('fake timers: time only moves when you move it', () => {
  vi.useFakeTimers();
  const done = vi.fn();
  setTimeout(done, 1000);

  vi.advanceTimersByTime(999);
  expect(done).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(done).toHaveBeenCalledOnce();
});
