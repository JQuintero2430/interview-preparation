// Output questions for module 04, sections 5 (async/await) and 6 (async iteration).
import { captureLogs, flushTasks } from '../capture';

describe('04 · async/await', () => {
  it('Q04.18 `return promise` inside try is not caught; `return await promise` is', async () => {
    const lines = await captureLogs(async (log) => {
      async function failing(): Promise<string> {
        throw new Error('boom');
      }
      async function withoutAwait(): Promise<string> {
        try {
          return failing();
        } catch {
          return 'fallback';
        }
      }
      async function withAwait(): Promise<string> {
        try {
          return await failing();
        } catch {
          return 'fallback';
        }
      }
      withoutAwait().then(
        (v) => log('withoutAwait', v),
        (e: Error) => log('withoutAwait rejected', e.message),
      );
      withAwait().then((v) => log('withAwait', v));
      await flushTasks();
    });
    expect(lines).toEqual(['withAwait fallback', 'withoutAwait rejected boom']);
  });

  it('Q04.19 forEach does not wait for async callbacks', async () => {
    const lines = await captureLogs(async (log) => {
      const ids = [1, 2];
      async function save(id: number): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 0));
        log('saved', id);
      }
      async function saveAll(): Promise<void> {
        ids.forEach(async (id) => {
          await save(id);
        });
        log('all saved?');
      }
      await saveAll();
      log('after saveAll');
      await flushTasks();
    });
    expect(lines).toEqual(['all saved?', 'after saveAll', 'saved 1', 'saved 2']);
  });
});

describe('04 · async iteration', () => {
  it('Q04.22 breaking out of for await calls return(), which runs the generator’s finally', async () => {
    const lines = await captureLogs(async (log) => {
      async function* numbers(): AsyncGenerator<number> {
        try {
          yield 1;
          yield 2;
          yield 3;
        } finally {
          log('cleanup');
        }
      }
      for await (const n of numbers()) {
        log('got', n);
        if (n === 2) break;
      }
      log('after loop');
    });
    expect(lines).toEqual(['got 1', 'got 2', 'cleanup', 'after loop']);
  });
});
