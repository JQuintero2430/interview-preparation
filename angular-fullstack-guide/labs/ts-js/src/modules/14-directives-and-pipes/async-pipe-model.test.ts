// Exercise 14.5 tests: a model of the behavior read in AsyncPipe 22.2.1, not Angular's pipe (sections 5 and 8).
import { describe, expect, it } from 'vitest';
import { createAsyncPipeModel, InvalidPipeArgumentError, type Subscribable } from './async-pipe-model';

interface Stream<T> extends Subscribable<T> {
  readonly subscribes: number;
  readonly unsubscribes: number;
  emit(value: T): void;
  fail(error: unknown): void;
}

function stream<T>(initial?: T): Stream<T> {
  const observers = new Set<{ next: (value: T) => void; error: (error: unknown) => void }>();
  let subscribes = 0;
  let unsubscribes = 0;
  return {
    get subscribes() {
      return subscribes;
    },
    get unsubscribes() {
      return unsubscribes;
    },
    subscribe(observer) {
      subscribes++;
      observers.add(observer);
      if (initial !== undefined) observer.next(initial);
      return {
        unsubscribe: () => {
          unsubscribes++;
          observers.delete(observer);
        },
      };
    },
    emit: (value) => observers.forEach((o) => o.next(value)),
    fail: (error) => observers.forEach((o) => o.error(error)),
  };
}

function setup<T>() {
  const host = {
    marks: 0,
    errors: [] as unknown[],
    markForCheck() {
      host.marks++;
    },
    reportError(error: unknown) {
      host.errors.push(error);
    },
  };
  return { host, pipe: createAsyncPipeModel<T>(host) };
}

describe('E14.5 a model of the async pipe', () => {
  it('transform(null) returns null and subscribes to nothing', () => {
    const { pipe } = setup<number>();
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeNull();
  });

  it('the first call subscribes, returns the latest value (null until one arrives) and a later emission is returned by the next transform and calls markForCheck once', () => {
    const { host, pipe } = setup<number>();
    const source = stream<number>();
    expect(pipe.transform(source)).toBeNull();
    expect(source.subscribes).toBe(1);
    source.emit(1);
    expect(host.marks).toBe(1);
    expect(pipe.transform(source)).toBe(1);
  });

  it('a value emitted synchronously during the first subscribe is returned without calling markForCheck', () => {
    const { host, pipe } = setup<number>();
    expect(pipe.transform(stream(7))).toBe(7);
    expect(host.marks).toBe(0);
  });

  it('passing a different source unsubscribes the old one first, resets the value to null, and values the old source emits afterwards are ignored', () => {
    const { host, pipe } = setup<number>();
    const first = stream<number>();
    const second = stream<number>();
    pipe.transform(first);
    first.emit(1);
    expect(pipe.transform(second)).toBeNull();
    expect(first.unsubscribes).toBe(1);
    first.emit(99);
    expect(pipe.transform(second)).toBeNull();
    expect(host.marks).toBe(1);
    second.emit(2);
    expect(pipe.transform(second)).toBe(2);
  });

  it('passing the same source again does not subscribe again', () => {
    const { pipe } = setup<number>();
    const source = stream<number>();
    pipe.transform(source);
    pipe.transform(source);
    expect(source.subscribes).toBe(1);
  });

  it('destroy() unsubscribes and later emissions neither store a value nor call markForCheck', () => {
    const { host, pipe } = setup<number>();
    const source = stream<number>();
    pipe.transform(source);
    source.emit(1);
    pipe.destroy();
    source.emit(2);
    expect(source.unsubscribes).toBe(1);
    expect(host.marks).toBe(1);
    expect(pipe.transform(null)).toBeNull();
  });

  it('an error goes to reportError, the last value stays, and promises are supported with the same rules', async () => {
    const { host, pipe } = setup<number>();
    const source = stream<number>();
    pipe.transform(source);
    source.emit(1);
    source.fail('boom');
    expect(host.errors).toEqual(['boom']);
    expect(pipe.transform(source)).toBe(1);

    const promised = setup<string>();
    const ok = Promise.resolve('done');
    expect(promised.pipe.transform(ok)).toBeNull();
    await ok;
    expect(promised.pipe.transform(ok)).toBe('done');
    expect(promised.host.marks).toBe(1);

    const rejected = Promise.reject(new Error('no'));
    const other = setup<string>();
    other.pipe.transform(rejected);
    await rejected.catch(() => undefined);
    expect(other.host.errors).toHaveLength(1);

    const stale = setup<string>();
    const late = Promise.resolve('late');
    stale.pipe.transform(late);
    stale.pipe.destroy();
    await late;
    expect(stale.host.marks).toBe(0);
  });

  it('a plain object or a function throws InvalidPipeArgumentError', () => {
    const { pipe } = setup<number>();
    expect(() => pipe.transform({} as never)).toThrow(InvalidPipeArgumentError);
    expect(() => pipe.transform((() => 1) as never)).toThrow(InvalidPipeArgumentError);
    expect(() => pipe.transform({ toString: () => 'orders' } as never)).toThrow(
      "InvalidPipeArgument: 'orders' for pipe 'AsyncPipe'",
    );
  });
});
