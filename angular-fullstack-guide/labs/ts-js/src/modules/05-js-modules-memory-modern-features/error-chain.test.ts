import { AppError, describeChain, isAppError } from './error-chain';

// A variable specifier keeps node:vm out of the bundler's static graph.
const vmSpecifier = 'node:vm';
const { runInNewContext } = (await import(vmSpecifier)) as { runInNewContext: (code: string) => unknown };

describe('E05.2 error chain toolkit', () => {
  it('AppError keeps its code, message and cause, and reports the name AppError', () => {
    const root = new Error('ECONNRESET');
    const error = new AppError('SAVE_FAILED', 'save failed', { cause: root });
    expect([error.code, error.message, error.cause, String(error), error instanceof Error]).toEqual([
      'SAVE_FAILED',
      'save failed',
      root,
      'AppError: save failed',
      true,
    ]);
  });

  it('describeChain lists a cause chain from the outermost error to the root', () => {
    const root = new Error('ECONNRESET');
    const request = new TypeError('request failed', { cause: root });
    expect(describeChain(new AppError('SAVE_FAILED', 'save failed', { cause: request }))).toEqual([
      'AppError [SAVE_FAILED]: save failed',
      'caused by: TypeError: request failed',
      'caused by: Error: ECONNRESET',
    ]);
  });

  it('AggregateError members are listed indented under it, with their own causes', () => {
    const batch = new AggregateError(
      [new Error('a.png', { cause: new Error('timeout') }), new AppError('TOO_LARGE', 'c.png')],
      '2 of 3 uploads failed',
    );
    expect(describeChain(batch)).toEqual([
      'AggregateError: 2 of 3 uploads failed',
      '  Error: a.png',
      '  caused by: Error: timeout',
      '  AppError [TOO_LARGE]: c.png',
    ]);
  });

  it('a cycle in the chain is reported once and stops the walk', () => {
    const first = new Error('first');
    const second = new Error('second', { cause: first });
    first.cause = second;
    expect(describeChain(first)).toEqual(['Error: first', 'caused by: Error: second', 'caused by: [cycle] Error: first']);
  });

  it('non-Error throwables are described instead of throwing', () => {
    expect([
      describeChain('oops'),
      describeChain(undefined),
      describeChain(Object.create(null)),
      describeChain(new Error('wrapped', { cause: 42 })),
    ]).toEqual([
      ['non-Error value: "oops"'],
      ['non-Error value: undefined'],
      ['non-Error value: [object Object]'],
      ['Error: wrapped', 'caused by: non-Error value: 42'],
    ]);
  });

  it('isAppError is true for an AppError from another realm and false for a fake or a plain Error', () => {
    const foreign = runInNewContext(`
      class AppError extends Error { [Symbol.for('app.error')] = true; code = 'REMOTE'; }
      new AppError('from another realm');
    `);
    const fake = Object.assign(Object.create(Error.prototype), { [Symbol.for('app.error')]: true });
    expect([foreign instanceof AppError, isAppError(foreign)]).toEqual([false, true]);
    expect([isAppError(fake), isAppError(new Error('plain')), isAppError(new AppError('LOCAL', 'here'))]).toEqual([
      false,
      false,
      true,
    ]);
  });
});
