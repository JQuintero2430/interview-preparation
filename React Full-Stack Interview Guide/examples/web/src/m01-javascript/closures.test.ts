import { createSnapshotDemo, idGenerator, makeCounter, once } from './closures';

test('closures share the variable, not a copy of the value', () => {
  const c = makeCounter();
  c.increment();
  c.increment();
  expect(c.read()).toBe(2);
});

test('each call to the factory creates an independent variable', () => {
  const a = makeCounter();
  const b = makeCounter();
  a.increment();
  expect(a.read()).toBe(1);
  expect(b.read()).toBe(0);
});

test('a handler from an old "render" is stale; the shared variable is not', () => {
  const demo = createSnapshotDemo();
  const first = demo.render();
  demo.setState(5);
  expect(first.handler()).toBe(0); // stale closure
  expect(first.live()).toBe(5); // like reading ref.current
  expect(demo.render().handler()).toBe(5); // a new render captures the new value
});

test('IIFE module pattern keeps state private', () => {
  expect(idGenerator.nextId()).toBe(1);
  expect(idGenerator.nextId()).toBe(2);
  expect(Object.keys(idGenerator)).toEqual(['nextId']);
});

test('once runs the function a single time', () => {
  const fn = vi.fn((n: number) => n * 2);
  const wrapped = once(fn);
  expect(wrapped(2)).toBe(4);
  expect(wrapped(100)).toBe(4);
  expect(fn).toHaveBeenCalledTimes(1);
});
