import { EventEmitter } from './eventEmitter';

type Events = { greet: [name: string]; done: [] };

test('emits to listeners in subscription order with typed arguments', () => {
  const bus = new EventEmitter<Events>();
  const seen: string[] = [];
  bus.on('greet', (n) => seen.push(`a:${n}`));
  bus.on('greet', (n) => seen.push(`b:${n}`));
  expect(bus.emit('greet', 'ada')).toBe(true);
  expect(seen).toEqual(['a:ada', 'b:ada']);
});

test('emit returns false with no listeners', () => {
  const bus = new EventEmitter<Events>();
  expect(bus.emit('done')).toBe(false);
});

test('on returns an unsubscribe function', () => {
  const bus = new EventEmitter<Events>();
  const fn = vi.fn();
  const off = bus.on('greet', fn);
  bus.emit('greet', 'x');
  off();
  bus.emit('greet', 'y');
  expect(fn).toHaveBeenCalledTimes(1);
  expect(bus.listenerCount('greet')).toBe(0);
});

test('off removes by listener identity', () => {
  const bus = new EventEmitter<Events>();
  const fn = vi.fn();
  bus.on('greet', fn);
  bus.off('greet', fn);
  bus.emit('greet', 'x');
  expect(fn).not.toHaveBeenCalled();
});

test('once fires a single time and can be removed with off', () => {
  const bus = new EventEmitter<Events>();
  const fn = vi.fn();
  bus.once('greet', fn);
  bus.emit('greet', '1');
  bus.emit('greet', '2');
  expect(fn).toHaveBeenCalledTimes(1);

  const never = vi.fn();
  bus.once('greet', never);
  bus.off('greet', never);
  bus.emit('greet', '3');
  expect(never).not.toHaveBeenCalled();
});

test('a listener that unsubscribes itself during emit does not skip its neighbour', () => {
  const bus = new EventEmitter<Events>();
  const calls: string[] = [];
  const offFirst = bus.on('done', () => {
    calls.push('first');
    offFirst();
  });
  bus.on('done', () => calls.push('second'));
  bus.emit('done');
  bus.emit('done');
  expect(calls).toEqual(['first', 'second', 'second']);
});
