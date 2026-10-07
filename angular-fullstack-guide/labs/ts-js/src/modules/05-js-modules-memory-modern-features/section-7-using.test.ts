// Section 7 claims: `using`, `await using`, SuppressedError and DisposableStack. The Vitest tests run the
// TypeScript-compiled form; the last test runs the same rules natively in Node 24 through a fixture.
import { runNode, stdoutLines } from '../../outputs/run-node';

function tracked(log: string[], name: string, failOnDispose = false): Disposable {
  return {
    [Symbol.dispose]() {
      log.push(`dispose ${name}`);
      if (failOnDispose) throw new Error(`${name} failed to close`);
    },
  };
}

describe('Module 05 · section 7: explicit resource management', () => {
  it('Section 7: using disposes at block end, in reverse declaration order', () => {
    const log: string[] = [];
    {
      using connection = tracked(log, 'connection');
      using transaction = tracked(log, 'transaction');
      log.push(`body uses ${typeof connection} and ${typeof transaction}`);
    }
    expect(log).toEqual(['body uses object and object', 'dispose transaction', 'dispose connection']);
  });

  it('Section 7: when the body and a disposer both throw, the result is a SuppressedError holding both', () => {
    const log: string[] = [];
    let caught: unknown;
    try {
      using file = tracked(log, 'file', true);
      log.push(`writing to ${typeof file}`);
      throw new Error('write failed');
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(SuppressedError);
    const suppressedError = caught as SuppressedError;
    expect([(suppressedError.error as Error).message, (suppressedError.suppressed as Error).message]).toEqual([
      'file failed to close',
      'write failed',
    ]);
  });

  it('Section 7: await using awaits each asyncDispose, in reverse order', async () => {
    const log: string[] = [];
    const asyncResource = (name: string): AsyncDisposable => ({
      async [Symbol.asyncDispose]() {
        await Promise.resolve();
        log.push(`closed ${name}`);
      },
    });
    {
      await using first = asyncResource('first');
      await using second = asyncResource('second');
      log.push(`opened ${typeof first} ${typeof second}`);
    }
    expect(log).toEqual(['opened object object', 'closed second', 'closed first']);
  });

  it('Section 7: DisposableStack collects use, adopt and defer, and move hands them to a new owner', () => {
    const log: string[] = [];
    const stack = new DisposableStack();
    stack.defer(() => log.push('deferred'));
    stack.adopt('handle', (handle) => log.push(`released ${handle}`));
    stack.use(tracked(log, 'resource'));
    const owner = stack.move();
    expect(stack.disposed).toBe(true);
    owner.dispose();
    expect(log).toEqual(['dispose resource', 'released handle', 'deferred']);
    expect(() => stack.defer(() => undefined)).toThrow(ReferenceError);
  });

  it('Section 7: null and undefined are skipped, and an object without Symbol.dispose throws TypeError', () => {
    expect(() => {
      using nothing = null;
      using alsoNothing = undefined;
      return [nothing, alsoNothing];
    }).not.toThrow();
    expect(() => {
      using notDisposable = {} as Disposable;
      return notDisposable;
    }).toThrow(TypeError);
  });

  it('Section 7: Node 24 runs using natively with the same order and SuppressedError', () => {
    const run = runNode(new URL('./fixtures/section-7/native.mjs', import.meta.url));
    expect(stdoutLines(run)).toEqual([
      'body runs',
      'dispose transaction',
      'dispose connection',
      'dispose file',
      'SuppressedError | file failed to close | write failed',
    ]);
  });
});
