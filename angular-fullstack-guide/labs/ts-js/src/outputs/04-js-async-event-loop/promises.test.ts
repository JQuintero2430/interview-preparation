// Output questions for module 04, sections 3 (promises) and 4 (combinators).
import { captureLogs, flushTasks } from '../capture';

describe('04 · promises', () => {
  it('Q04.10 the executor runs synchronously, and a promise settles only once', async () => {
    const lines = await captureLogs(async (log) => {
      const p = new Promise<string>((resolve, reject) => {
        log('executor');
        resolve('first');
        resolve('second');
        reject(new Error('ignored'));
        log('after resolve');
        throw new Error('swallowed');
      });
      p.then((value) => log('then', value));
      log('sync end');
      await flushTasks();
    });
    expect(lines).toEqual(['executor', 'after resolve', 'sync end', 'then first']);
  });

  it('Q04.11 values flow down the chain; a throw skips to the next rejection handler', async () => {
    const lines = await captureLogs(async (log) => {
      Promise.resolve(1)
        .then((v) => {
          log('a', v);
          return v + 1;
        })
        .then((v) => {
          log('b', v);
          throw new Error('oops');
        })
        .then((v) => log('c', v))
        .catch((e: Error) => {
          log('catch', e.message);
          return 'recovered';
        })
        .then((v) => log('d', v))
        .finally(() => log('finally'));
      await flushTasks();
    });
    expect(lines).toEqual(['a 1', 'b 2', 'catch oops', 'd recovered', 'finally']);
  });

  it('Q04.12 resolving a promise with another promise costs two extra microtask ticks', async () => {
    const lines = await captureLogs(async (log) => {
      const inner = Promise.resolve('inner');
      log('same object', Promise.resolve(inner) === inner);
      new Promise((resolve) => resolve(inner)).then(() => log('outer resolved'));
      Promise.resolve()
        .then(() => log('tick 1'))
        .then(() => log('tick 2'))
        .then(() => log('tick 3'));
      await flushTasks();
    });
    expect(lines).toEqual(['same object true', 'tick 1', 'tick 2', 'outer resolved', 'tick 3']);
  });
});

describe('04 · combinators', () => {
  it('Q04.15 Promise.all fails fast but does not stop the other work; allSettled waits for everything', async () => {
    const lines = await captureLogs(async (log) => {
      const slow = new Promise<string>((resolve) =>
        setTimeout(() => {
          log('slow finished');
          resolve('slow');
        }, 0),
      );
      const failed = Promise.reject(new Error('boom'));
      Promise.all([slow, failed]).then(
        (values) => log('all', values.join()),
        (e: Error) => log('all rejected', e.message),
      );
      Promise.allSettled([slow, failed]).then((results) =>
        log('allSettled', results.map((r) => r.status).join()),
      );
      await flushTasks();
    });
    expect(lines).toEqual(['all rejected boom', 'slow finished', 'allSettled fulfilled,rejected']);
  });

  it('Q04.16 race settles with the first settlement; any waits for the first fulfilment', async () => {
    const lines = await captureLogs(async (log) => {
      const late = new Promise<string>((resolve) => setTimeout(() => resolve('late ok'), 0));
      const fastFail = Promise.reject(new Error('fast fail'));
      Promise.race([fastFail, late]).then(
        (v) => log('race', v),
        (e: Error) => log('race rejected', e.message),
      );
      Promise.any([fastFail, late]).then((v) => log('any', v));
      Promise.any([fastFail, Promise.reject(new Error('second'))]).catch((e: AggregateError) =>
        log('any rejected', e instanceof AggregateError, e.errors.length),
      );
      await flushTasks();
    });
    expect(lines).toEqual(['race rejected fast fail', 'any rejected true 2', 'any late ok']);
  });
});
