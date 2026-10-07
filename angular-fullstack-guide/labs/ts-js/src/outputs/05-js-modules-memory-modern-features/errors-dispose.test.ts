// Q05.15–Q05.19. The cache, the subclasses and the follow-up checks run in Vitest; the cause and disposal fixtures run in a real node process, which runs `using` natively.
import { LruCache } from './lru';
import { runNode, stdoutLines } from '../run-node';

const fixture = (path: string) => new URL(`./fixtures/${path}`, import.meta.url);

describe('Module 05 · Output questions: caches, errors and disposal', () => {
  it('Q05.15 LruCache evicts the least recently used entry, and get() refreshes an entry', () => {
    const cache = new LruCache<string, number>(2);
    cache.set('a', 1);
    cache.set('b', 2);
    expect(cache.get('a')).toBe(1);
    cache.set('c', 3);
    expect([cache.get('b'), cache.keys()]).toEqual([undefined, ['a', 'c']]);
  });

  it('Q05.16 a subclass reports the name "Error" until it sets its own, which a static block can do once on the prototype', () => {
    class HttpError extends Error {}
    class NotFoundError extends Error {
      static {
        this.prototype.name = 'NotFoundError';
      }
    }
    expect([String(new HttpError('nope')), new HttpError('nope') instanceof HttpError]).toEqual(['Error: nope', true]);
    expect([String(new NotFoundError('gone')), Object.hasOwn(new NotFoundError('gone'), 'name')]).toEqual([
      'NotFoundError: gone',
      false,
    ]);
  });

  it('Q05.17 a cause chain walks to the root, cause is own only when passed, and both AggregateErrors list their errors', () => {
    expect(stdoutLines(runNode(fixture('q05-17/main.mjs')))).toEqual([
      'save failed <- request failed <- ECONNRESET',
      'false true',
      "AggregateError | 2 of 3 uploads failed | [ 'a.png', 'c.png' ]",
      'AggregateError | All promises were rejected | 2',
    ]);
  });

  it('Q05.19 using and DisposableStack dispose in reverse order, and two failing disposers become a SuppressedError', () => {
    expect(stdoutLines(runNode(fixture('q05-19/main.mjs')))).toEqual([
      'body',
      'dispose lock',
      'dispose socket',
      'deferred',
      'SuppressedError | deferred failed | lock failed',
    ]);
  });

  it('Q05.17 follow-up: JSON.stringify drops message, stack and cause, because they are non-enumerable', () => {
    expect(JSON.stringify(new Error('top', { cause: new Error('root') }))).toBe('{}');
  });

  it('Q05.19 follow-ups: one failing disposer throws its own error, and three failures nest SuppressedErrors', () => {
    const resource = (name: string, failOnDispose = false): Disposable => ({
      [Symbol.dispose]() {
        if (failOnDispose) throw new Error(name);
      },
    });
    const run = (body: () => void): unknown => {
      try {
        body();
        return undefined;
      } catch (error) {
        return error;
      }
    };
    const single = run(() => {
      using lock = resource('lock', true);
      using socket = resource('socket');
    });
    expect([single instanceof SuppressedError, (single as Error).message]).toEqual([false, 'lock']);

    const triple = run(() => {
      using lock = resource('lock', true);
      using socket = resource('socket', true);
      throw new Error('body');
    }) as SuppressedError;
    const inner = triple.suppressed as SuppressedError;
    expect([triple.error.message, inner.error.message, inner.suppressed.message]).toEqual(['lock', 'socket', 'body']);
  });
});
