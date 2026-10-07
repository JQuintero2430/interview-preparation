// Output questions for module 04, section 1 (tasks vs microtasks) and section 8 (starvation).
// Every snippet uses only spec-defined ordering: promise jobs, queueMicrotask, setTimeout, EventTarget.
import { captureLogs, flushTasks } from '../capture';

describe('04 · the event loop', () => {
  it('Q04.03 sync code, then microtasks in FIFO order, then the timer', async () => {
    const lines = await captureLogs(async (log) => {
      log('script start');
      setTimeout(() => log('timeout'), 0);
      Promise.resolve().then(() => log('then'));
      queueMicrotask(() => log('microtask'));
      log('script end');
      await flushTasks();
    });
    expect(lines).toEqual(['script start', 'script end', 'then', 'microtask', 'timeout']);
  });

  it('Q04.04 the classic async1/async2 puzzle', async () => {
    const lines = await captureLogs(async (log) => {
      async function async1(): Promise<void> {
        log('async1 start');
        await async2();
        log('async1 end');
      }
      async function async2(): Promise<void> {
        log('async2');
      }
      log('script start');
      setTimeout(() => log('setTimeout'), 0);
      void async1();
      new Promise<void>((resolve) => {
        log('promise1');
        resolve();
      }).then(() => log('promise2'));
      log('script end');
      await flushTasks();
    });
    expect(lines).toEqual([
      'script start',
      'async1 start',
      'async2',
      'promise1',
      'script end',
      'async1 end',
      'promise2',
      'setTimeout',
    ]);
  });

  it('Q04.05 microtasks drain completely after every task, including ones queued meanwhile', async () => {
    const lines = await captureLogs(async (log) => {
      setTimeout(() => {
        log('timeout 1');
        Promise.resolve().then(() => log('then inside timeout 1'));
      }, 0);
      setTimeout(() => log('timeout 2'), 0);
      Promise.resolve().then(() => {
        log('then 1');
        setTimeout(() => log('timeout 3'), 0);
        queueMicrotask(() => log('microtask inside then 1'));
      });
      await flushTasks();
      await flushTasks(); // timeout 3 was queued after the first flushTasks timer
    });
    expect(lines).toEqual([
      'then 1',
      'microtask inside then 1',
      'timeout 1',
      'then inside timeout 1',
      'timeout 2',
      'timeout 3',
    ]);
  });

  it('Q04.06 dispatchEvent from script runs listeners synchronously, so microtasks wait for the whole dispatch', async () => {
    const lines = await captureLogs(async (log) => {
      const target = new EventTarget();
      target.addEventListener('ping', () => {
        log('listener 1');
        queueMicrotask(() => log('microtask 1'));
      });
      target.addEventListener('ping', () => {
        log('listener 2');
        queueMicrotask(() => log('microtask 2'));
      });
      target.dispatchEvent(new Event('ping'));
      log('after dispatch');
      await flushTasks();
    });
    expect(lines).toEqual(['listener 1', 'listener 2', 'after dispatch', 'microtask 1', 'microtask 2']);
  });

  it('Q04.28 a self-rescheduling microtask runs to completion before any timer', async () => {
    const lines = await captureLogs(async (log) => {
      let count = 0;
      setTimeout(() => log('timeout sees', count), 0);
      function spin(): void {
        count++;
        if (count < 1_000) queueMicrotask(spin);
      }
      queueMicrotask(spin);
      log('sync end', count);
      await flushTasks();
    });
    expect(lines).toEqual(['sync end 0', 'timeout sees 1000']);
  });

  it('Section 8: several enqueue calls in one task produce one queueMicrotask flush', async () => {
    const batches: string[][] = [];
    const notify = (changes: string[]) => batches.push(changes);
    const pending: string[] = [];
    let scheduled = false;
    function enqueue(change: string): void {
      pending.push(change);
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        notify(pending.splice(0));
      });
    }
    enqueue('a');
    enqueue('b');
    enqueue('c');
    expect(batches).toEqual([]); // nothing runs during the synchronous calls
    await flushTasks();
    enqueue('d');
    await flushTasks();
    expect(batches).toEqual([['a', 'b', 'c'], ['d']]);
  });
});
