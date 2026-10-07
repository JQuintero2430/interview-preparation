// @vitest-environment jsdom
// Q08.01–Q08.06. Only Q08.06 is an Output question; Q08.01–Q08.05 are documentation answers whose order-of-operations
// evidence is in the section 2 test (the loop in Q08.04).
import { captureLogs, flushTasks } from '../capture';

describe('Module 08 · Output questions: rendering and the DOM', () => {
  it('Q08.06 MutationObserver records from one synchronous run arrive in one callback, queued before the later promise', async () => {
    const lines = await captureLogs(async (log) => {
      const list = document.createElement('ul');
      new MutationObserver((records) => log(`observer: ${records.length} records`)).observe(list, { childList: true });
      list.append(document.createElement('li'));
      Promise.resolve().then(() => log('promise'));
      list.append(document.createElement('li'));
      log('sync done');
      await flushTasks();
    });
    expect(lines).toEqual(['sync done', 'observer: 2 records', 'promise']);
  });
});
