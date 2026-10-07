// Section 6 claims: error subclasses, causes, AggregateError, Error.isError across realms, non-Error throws.
import { runNode } from '../../outputs/run-node';

const vmSpecifier = 'node:vm';
const { runInNewContext } = (await import(vmSpecifier)) as { runInNewContext: (code: string) => unknown };

class ValidationError extends Error {
  constructor(
    message: string,
    readonly field: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'ValidationError';
  }
}

describe('Module 05 · section 6: errors', () => {
  it('Section 6: a subclass sets name, keeps instanceof, and V8 formats the stack header from the final name', () => {
    const error = new ValidationError('email is required', 'email');
    expect([error.name, error.field, error instanceof ValidationError, error instanceof Error]).toEqual([
      'ValidationError',
      'email',
      true,
      true,
    ]);
    expect(String(error)).toBe('ValidationError: email is required');
    expect(error.stack?.split('\n')[0]).toBe('ValidationError: email is required');
  });

  it('Section 6: cause is an own property only when the option is passed', () => {
    const lowLevel = new Error('ECONNRESET');
    const wrapped = new Error('save failed', { cause: lowLevel });
    expect(wrapped.cause).toBe(lowLevel);
    expect(Object.hasOwn(wrapped, 'cause')).toBe(true);
    expect(Object.hasOwn(new Error('plain'), 'cause')).toBe(false);
  });

  it('Section 6: Node prints the cause chain under [cause]', () => {
    const run = runNode(new URL('./fixtures/section-6/print-cause.mjs', import.meta.url));
    expect(run.stdout).toMatch(/^Error: save failed\n/);
    expect(run.stdout).toContain('[cause]: Error: ECONNRESET');
  });

  it('Section 6: AggregateError carries every failure in errors', () => {
    const aggregate = new AggregateError([new Error('a'), new TypeError('b')], '2 uploads failed');
    expect([aggregate.name, aggregate.message, aggregate.errors.length, aggregate instanceof Error]).toEqual([
      'AggregateError',
      '2 uploads failed',
      2,
      true,
    ]);
  });

  it('Section 6: Error.isError is true across realms where instanceof is false, and false for a fake', () => {
    const foreign = runInNewContext('new Error("from another realm")');
    expect([foreign instanceof Error, Error.isError(foreign)]).toEqual([false, true]);
    const fake: unknown = Object.create(Error.prototype);
    expect([fake instanceof Error, Error.isError(fake)]).toEqual([true, false]);
  });

  it('Section 6: anything can be thrown, so a caught value may not be an Error at all', () => {
    let caught: unknown;
    try {
      throw 'oops';
    } catch (error) {
      caught = error;
    }
    expect([typeof caught, caught instanceof Error, Error.isError(caught)]).toEqual(['string', false, false]);
  });
});
