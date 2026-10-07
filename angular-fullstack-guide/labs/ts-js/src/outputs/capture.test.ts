import { captureLogs, flushTasks } from './capture';

describe('captureLogs', () => {
  it('records synchronous, microtask and macrotask output in execution order', async () => {
    const lines = await captureLogs(async (log) => {
      setTimeout(() => log('timeout'), 0);
      void Promise.resolve().then(() => log('microtask'));
      log('sync');
      await flushTasks();
    });
    expect(lines).toEqual(['sync', 'microtask', 'timeout']);
  });
});

describe('captureLogs formatting', () => {
  it('formats arguments the way console.log does, not with String()', async () => {
    const lines = await captureLogs((log) => {
      log(-0, 10n, [1, 2]);
      log({ a: 1 }, 'text');
    });
    expect(lines).toEqual(['-0 10n [ 1, 2 ]', '{ a: 1 } text']);
  });
});
