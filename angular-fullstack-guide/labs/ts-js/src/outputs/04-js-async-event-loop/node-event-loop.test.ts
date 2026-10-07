// Output question for module 04, section 2: Node-only ordering (process.nextTick).
// The labs do not install @types/node, so `process` is read from globalThis with a minimal type.
// The behaviour asserted is Node's: process.nextTick does not exist in browsers.
import { captureLogs, flushTasks } from '../capture';

interface NodeProcessLike {
  nextTick(callback: () => void): void;
}
const nodeProcess = Reflect.get(globalThis, 'process') as NodeProcessLike;
const fsSpecifier = 'node:fs';
const { readFile } = (await import(fsSpecifier)) as { readFile(path: URL, callback: () => void): void };
const setImmediateFn = Reflect.get(globalThis, 'setImmediate') as (callback: () => void) => void;

describe('04 · Node event loop', () => {
  it('Q04.08 inside a timer callback: nextTick queue, then promise jobs, then the next timer', async () => {
    const lines = await captureLogs(async (log) => {
      setTimeout(() => {
        log('timer');
        setTimeout(() => log('next timer'), 0);
        Promise.resolve().then(() => log('promise'));
        queueMicrotask(() => log('queueMicrotask'));
        nodeProcess.nextTick(() => log('nextTick'));
      }, 0);
      await flushTasks();
      await flushTasks(); // 'next timer' was queued after the first flushTasks timer
    });
    expect(lines).toEqual(['timer', 'nextTick', 'promise', 'queueMicrotask', 'next timer']);
  });

  it('Section 2: inside an I/O callback, setImmediate runs before setTimeout(fn, 0)', async () => {
    for (let run = 0; run < 20; run++) {
      const lines = await captureLogs(
        (log) =>
          new Promise<void>((done) => {
            readFile(new URL(import.meta.url), () => {
              setTimeout(() => {
                log('timeout');
                done();
              }, 0);
              setImmediateFn(() => log('immediate'));
            });
          }),
      );
      expect(lines).toEqual(['immediate', 'timeout']);
    }
  });
});
